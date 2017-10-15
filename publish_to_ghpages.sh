#!/bin/sh

echo "Removing existing files"
rm -rf public

echo "Generating site"
hugo

echo "Updating master branch"
git checkout master && mv public/* . && git add . && git commit -m "Publishing to master (publish.sh)"
