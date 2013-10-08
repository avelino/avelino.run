#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'Thiago Avelino'
SITENAME = u'avelino.xxx'
SITEURL = 'http://avelino.xxx'
MINI_BIO = u"Software engineer at #YACOWS. Code developer Opps, London, MongoDB. Open source development, changing the world of underwear"
BIO = u"Is Software Engineer in YACOWS and Mathematical USP, expert development of parsers and active in the open source community with committer in projects Django, Opps CMS, MongoDB, Riak and other... With the need to process large volumes of data publishing project. Today their focus of research and development include Python, NoSQL, distributed systems, and asynchronous."

STATIC_PATHS = ["images", ]

TIMEZONE = 'Europe/Paris'

DEFAULT_LANG = u'en'

DISPLAY_CATEGORIES_ON_MENU = False

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = 'rss.xml'
CATEGORY_FEED_ATOM = 'category/%s/rss.xml'
TAG_FEED_ATOM = 'tag/%s/rss.xml'

REVERSE_CATEGORY_ORDER = True

# Blogroll
LINKS =  ()

# Social widget
GITHUB_URL = 'http://github.com/avelino'
TWITTER_USERNAME = 'avelino0'
SOCIAL = (('Twitter', 'http://twitter.com/{0}'.format(TWITTER_USERNAME), '&#xe086;'),
          ('Github', GITHUB_URL, '&#xe037;'),
          ('Google Plus', 'https://plus.google.com/117982053078656626069/about', '&#xe039;'),
          ('LinkedIN', 'http://www.linkedin.com/in/avelino0', '&#xe052;'),
          )

DEFAULT_PAGINATION = 10

ARTICLE_URL = '{date:%Y}/{date:%m}/{date:%d}/{slug}'
ARTICLE_SAVE_AS = '{date:%Y}/{date:%m}/{date:%d}/{slug}/index.html'

FILES_TO_COPY = (
    ('extra/robots.txt', 'robots.txt'),
    ('extra/google5b2d0fc7703276fe.html', 'google5b2d0fc7703276fe.html'),
    ('extra/CNAME', 'CNAME'),
    ('extra/avatar.jpeg', 'theme/img/avatar.jpg'),
)

PLUGIN_PATH = 'plugins'
#PLUGINS = ['assets', 'sitemap', 'github_activity', 'related_posts']
PLUGINS = ['assets', 'sitemap', 'related_posts']

THEME = 'themes/avelino'

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
RELATIVE_URLS = True
