workflow "Deploy assets" {
  on = "push"
  resolves = [
    "Deploy public assets",
    "Deploy templates",
  ]
}

action "Install dependencies" {
  uses = "actions/npm@master"
  args = "ci"
}

action "Build assets" {
  needs = "Install dependencies"
  uses = "actions/npm@master"
  args = "run build"
}

action "Deploy public assets" {
  needs = "Build assets"
  uses = "actions/aws/cli@master"
  args = "s3 cp dist/ s3://mattmoriarity.com/ --acl public-read --recursive"
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
}

action "Deploy templates" {
  needs = "Build assets"
  uses = "actions/aws/cli@master"
  args = "s3 cp templates/ s3://mattmoriarity.com/_templates/ --recursive"
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
}
