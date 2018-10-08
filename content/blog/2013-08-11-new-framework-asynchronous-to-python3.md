+++
date = "2013-08-11"
title = "New web framework asynchronous to Python 3"
tags = ["python", "python-en", "nacho", "async", "framework"]
aliases = ["/2013/08/new-framework-asynchronous-to-python3"]
+++

I started a new project with the name nacho, **asynchronous** web framework for **Python 3**.

![Nacho Python3 Web Framework](/blog/nacho.png#center)


## Our goals

* It was designed to work on Python 3.x
* Some of syntax were inspired on Tornado's syntax
* Tornado is the default server, but Eventlet is stable as well
* Templates are done by Jinja2
* HTML5 as the big-main-thing
* Work friendly with NoSQL (otherwise we should stop talking about them)
* Handle asynchronous requests properly


## Example

```python
class MainHandler(ApplicationController):
    def get(self):
        data = {'title': 'testando lero lero'}
        self.render("home.html", **data)


r = Routers([(r"/", MainHandler),])
```
