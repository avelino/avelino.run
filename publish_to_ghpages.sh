#!/bin/sh

echo "Removing existing files"
rm -rf public

echo "Generating site"
hugo

echo "Updating master branch"
cd public && git add --all && git commit -m "Publishing to master (publish.sh)"
