+++
date = "2015-02-08"
title = "Where to start a project with bottle, Boilerplate"
tags = "python, bottle, boilerplate, framework, startproject"
aliases = ["/2015/02/where-to-start-a-project-with-bottle-boilerplate"]
+++

![A blueprint is a reproduction of a technical drawing, documenting an architecture or an engineering design.](/blueprint.jpg#center)

Developing python application using minimalist frameworks has become frequent in the Python community, for no reasons not to speak here. I see this change as a professional development where developers want to choose what is best for your application, simply use what little hide a group *(of pearls, or not**)* that is better.

Along with this evolution brings vices of many developers other frameworks (and/or technology), this can be a problem at the time of the taking of decision of which Python web framework to use.

I am a member of the team that keeps the [Bottle Framework](http://bottlepy.org/) and thinking of a better acceptance of the framework decided to create the **[bottle-boilerplate](https://github.com/avelino/bottle-boilerplate)**, a project that creates a scaffold using the structure of the bottle and its best practices on top of design pattern [MVC](https://en.wikipedia.org/wiki/Model-view-controller), thus simplifying the bootstrap starting a web application.


## Which libraries are used?

- bottle (based python web framework)
- click (manage commands at the prompt, example **runserver**)
- beaker (manage session)
- jinja2 (template engine)
- bottle-sqlalchemy (bottle plugin for connection with relational database)


## How to use?

The process failed use the simplest possible:

```bash
pip install bottle-boilerplate
bottle startproject YOU-PROJECT-NAME
```

If you want to open the documentation from the bottle:

```bash
bottle doc
```


## How to contribute?

The **bottle-boilerplate** is an open source project and accept what you want contribution (which come to improve the project). Is an interface (command line) to the [cookiecutter-bottle](https://github.com/avelino/cookiecutter-bottle), i.e. **bottle-boilerplate** on **startproject** will call [cookiecutter](http://cookiecutter.rtfd.org/) to create the application.

We need the contribution in **cookiecutter-bottle** to improve the application for example, write test, among other improvements. Send pull request free Synthase (PR).
