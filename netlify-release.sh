#!/usr/bin/env bash
git submodule update -f --init
hugo

# static-activitypub
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     release_os="linux-x64";;
    Darwin*)    release_os="osx-x64";;
    *)          release_os="UNKNOWN:${unameOut}"
esac
release_version="0.0.5"
release_name="activitypub-utils-$release_version-$release_os"
wget "https://github.com/mahomedalid/almost-static-activitypub/releases/download/$release_version/$release_name.tar.gz"
tar -xf "$release_name.tar.gz"

cd $release_name
./Rss2Outbox \
  --rssPath ../public/index.xml \
  --staticPath ../public \
  --siteActorUri "https://avelino.run/\@hey" \
  --authorUsername "\@hey\@avelino.run"
cd ..
