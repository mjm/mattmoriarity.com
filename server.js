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
    published: parseDate('2018-12-25T12:12:12Z')
  }
];

app.get('/', (req, res) => {
  res.render('index.html', { site, posts });
});

app.get('/*', (req, res, next) => {
  for (let post of posts) {
    if (post.permalink !== req.path) {
      continue;
    }

    res.render(`${post.type}.html`, { site, post });
    return;
  }
});

app.listen(8080, () => {
  console.log("Asset server is listening on port 8080");
});

function setupNunjucks(app) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'), {
    watch: true,
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
