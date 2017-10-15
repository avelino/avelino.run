#!/bin/sh

echo "Removing existing files"
rm -rf public

echo "Generating site"
hugo

echo "Updating master branch"
git checkout master && ll --ignore public | xargs rm -rf && cp -rf public/* . && rm -rf public && git add . && git commit -m "Publishing to master (publish.sh)"
