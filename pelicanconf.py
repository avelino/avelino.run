#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'Thiago Avelino'
SITENAME = u'Thiago Avelino'
SITEURL = 'http://avelino.us'

TIMEZONE = 'Europe/Paris'

DEFAULT_LANG = u'en'

DISPLAY_CATEGORIES_ON_MENU = False

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = 'rss.xml'
CATEGORY_FEED_ATOM = 'category/%s/rss.xml'

REVERSE_CATEGORY_ORDER = True

# Blogroll
LINKS =  (('Pelican', 'http://getpelican.com/'),
          ('Python.org', 'http://python.org/'),
          ('Jinja2', 'http://jinja.pocoo.org/'),
          ('You can modify those links in your config file', '#'),)

# Social widget
GITHUB_URL = 'http://github.com/avelino'
TWITTER_USERNAME = 'avelino0'
SOCIAL = (('twitter', 'http://twitter.com/{0}'.format(TWITTER_USERNAME)),
          ('github', GITHUB_URL),)

DEFAULT_PAGINATION = 10

ARTICLE_URL = '{date:%Y}/{date:%m}/{date:%d}/{slug}'
ARTICLE_SAVE_AS = '{date:%Y}/{date:%m}/{date:%d}/{slug}/index.html'

FILES_TO_COPY = (('static/robots.txt', 'robots.txt'),)

STATIC_PATHS = ["static"]

PLUGIN_PATH = 'plugins'
PLUGINS = ['assets', 'sitemap', 'github_activity', 'related_posts',
           'summary']

#THEME = 'themes/bootstrap2'

GITHUB_ACTIVITY_FEED = 'https://github.com/avelino.atom'
SITEMAP = {
    'format': 'xml',
    'priorities': {
        'articles': 0.5,
        'indexes': 0.5,
        'pages': 0.5
    },
    'changefreqs': {
        'articles': 'monthly',
        'indexes': 'daily',
        'pages': 'monthly'
    }
}

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
