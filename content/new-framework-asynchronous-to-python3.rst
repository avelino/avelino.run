New web framework asynchronous to Python 3
##########################################
:date: 2013-08-11 02:09
:author: avelino
:category: Python-EN
:tags: python, python-en, nacho, async, framework
:slug: new-web-framework-asynchronous-to-python3


.. image:: /media/nacho.png

I started a new project with the name `nacho <https://github.com/avelino/nacho>`_, asynchronous web framework for Python 3.


Our goals
---------

- It was designed to work on Python 3.x
- Some of syntax were inspired on Tornado's syntax
- Tornado is the default server, but Eventlet is stable as well
- Templates are done by Jinja2
- HTML5 as the big-main-thing
- Work friendly with NoSQL (otherwise we should stop talking about them)
- Handle asynchronous requests properly


Example
-------

.. code-block:: python
    #!/usr/bin/env python
    # -*- coding: utf-8 -*-
    import os
    from nacho.services.servers import NachoServer, AutoReload, AutoReloadFn
    from nacho.services.routers import Routers
    from nacho.controllers.base import ApplicationController


    class MainHandler(ApplicationController):
        def get(self):
            data = {'title': 'testando lero lero'}
            self.render("home.html", **data)


    r = Routers([(r"/", MainHandler),])
