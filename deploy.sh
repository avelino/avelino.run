#!/bin/bash
echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

echo "Removing existing files"
rm -rf public

echo "Generating site"
hugo

echo "Updating html branch"
msg="rebuilding site `date`, publishing to html"
git checkout html && ll --ignore public | xargs rm -rf && cp -rf public/* . && rm -rf public && git add . && git commit -m "$msg"

git push origin html

git checkout master
