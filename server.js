const express = require('express');
const nunjucks = require('nunjucks');

const parseDate = require ('date-fns/parse');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.config.js')
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

setupNunjucks(app);

const site = {
  title: 'Matt Moriarity',
  blogId: 'mattmoriarity.com'
};

const posts = [
  {
    type: 'entry',
    name: 'This is a test post',
    content: safe(`
    <p>This is a first paragraph.</p>
    <p>This is a second paragraph.</p>
    `),
    permalink: '/2018/12/this-is-a-test-post',
    published: parseDate('2018-12-25T12:12:12Z'),
    mentionCount: 2
  },
  {
    type: 'entry',
    content: safe(`
    <p>This is a first paragraph.</p>
    <p>This is a second paragraph.</p>
    <blockquote>
    What am I doing here?
    </blockquote>
    <p>How does it look with a paragraph around it?</p>
    `),
    permalink: '/2018/12/this-is-another-test-post',
    published: parseDate('2018-12-25T12:12:12Z')
  }
];

const mentions = {
  '/2018/12/this-is-a-test-post': [{
    type: 'entry',
    kind: 'reply',
    content: safe(`
    <p><a href="https://micro.blog/mjmoriarity">@mjmoriarity</a> Hey man what's up!?</p>
    `),
    url: 'https://micro.blog/example/1234567',
    published: parseDate('2018-12-25T12:12:12Z'),
    author: [{
      name: 'example',
      photo: [
        "https://micro.blog/mjmoriarity/avatar.jpg"
      ],
      type: 'card',
      url: 'https://micro.blog/example'
    }]
  }, {
    type: 'entry',
    kind: 'reply',
    content: safe(`
    <p>I'm not sure you've got the right idea here.</p>
    `),
    url: 'https://micro.blog/example/1234567',
    published: parseDate('2018-12-25T12:12:12Z'),
    author: [{
      name: 'example2',
      photo: [
        "https://micro.blog/mjmoriarity/avatar.jpg"
      ],
      type: 'card',
      url: 'https://micro.blog/example2'
    }]
  }, {
    type: 'entry',
    kind: 'like',
    url: 'https://micro.blog/example/1234567',
    published: parseDate('2018-12-25T12:12:12Z'),
    author: [{
      name: 'example2',
      photo: [
        "https://micro.blog/mjmoriarity/avatar.jpg"
      ],
      type: 'card',
      url: 'https://micro.blog/example2'
    }]
  }, {
    type: 'entry',
    kind: 'link',
    url: 'https://micro.blog/example/1234567',
    published: parseDate('2018-12-25T12:12:12Z'),
    author: [{
      name: 'example2',
      photo: [
        "https://micro.blog/mjmoriarity/avatar.jpg"
      ],
      type: 'card',
      url: 'https://micro.blog/example2'
    }]
  }]
};

app.get('/', (req, res) => {
  res.render('index.html', { site, posts });
});

app.get('/*', (req, res, next) => {
  for (let post of posts) {
    if (post.permalink !== req.path) {
      continue;
    }

    const ms = mentions[post.permalink] || [];

    res.render(`${post.type}.html`, { site, post, mentions: ms });
    return;
  }

  res.render('error.html', { site });
});

app.listen(8080, () => {
  console.log("Asset server is listening on port 8080");
});

function setupNunjucks(app) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates', {
    watch: true,
    noCache: true,
  }), {
    express: app
  });

  env.addFilter('feedlinks', () => '');
  env.addFilter('micropublinks', () => '');
  env.addFilter('dateformat', require('date-fns/format'));

  env.express(app);
}

function safe(str) {
  return new nunjucks.runtime.SafeString(str);
}
