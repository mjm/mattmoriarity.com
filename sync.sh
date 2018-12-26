#!/bin/bash

BUCKET=mattmoriarity.com

aws s3 cp site.css "s3://$BUCKET/site.css" --acl public-read
aws s3 cp templates/ "s3://$BUCKET/_templates/" --recursive
