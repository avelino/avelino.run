#!/usr/bin/env bash
git submodule update -f --init
hugo

# static-activitypub
release_version="0.0.5"
release_name="activitypub-utils-$release_version-linux-x64"
wget "https://github.com/mahomedalid/almost-static-activitypub/releases/download/$release_version/$release_name.tar.gz"
tar -xf "$release_name.tar.gz"

$release_name/Rss2Outbox \
  --rssPath ./public/index.xml \
  --staticPath ./public \
  --siteActorUri "https://avelino.run/\@hey" \
  --authorUsername "\@hey\@avelino.run"
