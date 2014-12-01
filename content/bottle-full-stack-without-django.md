# Bottle, full stack without Django

- date: 2014-12-01 10:40
- author: avelino
- category: Python-EN
- tags: bottle, python, framework, django, full-stack
- slug: bottle-full-stack-without-django

-------

This blogpost is based in a lecture I presented here in Brazil, follows the [slides](https://speakerdeck.com/avelino/bottle-o-full-stack-sem-django)!


![Bottle micro framework web](/media/bottle.png)

Bottle is a micro web framework compatible with WSGI, depends only on the Python standard library is compatible with python 2.6, 2.7, 3.2, 3.3 and 3.4, [single source file](https://github.com/defnull/bottle/blob/master/bottle.py). It was created by Marcel Hellkamp ([@defnull](https://github.com/defnull)) and maintained by the [community](https://github.com/orgs/bottlepy/people) that raised surrounding framework.

[Django](https://www.djangoproject.com/) is a framework for rapid development for web, written in Python, which uses the standard MTV (model-template-view) and pragmatic. Was originally created as a system to manage a journalistic site in the city of Lawrence, Kansas. Became an open source project and was published under a BSD license in 2005. The name Django was inspired by the jazz musician Django Reinhardt. Django became very known for having included batteries, i.e. several distributed libraries join the Centre of the framework for simplicity work (called "full stack").

Pragmatic is what contains practical, realistic considerations, with well-defined target. Be pragmatic is to be practical is to have goals defined. In other words, the team that developed the Django take some description of architecture and who uses Django follows this architecture without being able to change easily.

It's good a web framework have batteries included? Depends, if you use everything that the framework gives you Yes, but not all web designs are the same.

Many project does not use 80% than Django offers, in those cases that don't use more than 50% of what we pay the cost of offering Django someone have defined the architecture, i.e. lost in performance because the Django has many modules that will not be using and yet he will climb a few modules that we don't use. When we use a micro framework we do the role of architect of application development, since we don't have a set before architecture begins to develop is necessary to devote time to define the architecture of the application.

All the packages that we have on the Django Python library that can substitute for use in a micro framework!

* ORM - [SQLAlchemy](http://www.sqlalchemy.org/) to [bottle-sqlalchemy](https://github.com/iurisilvio/bottle-sqlalchemy)
* Forms - [WTForms](https://wtforms.readthedocs.org/en/latest/)
* Template Engine - [Jinja2](http://jinja.pocoo.org/docs/dev/), [mako](http://www.makotemplates.org/), etc
* Migration - [Alembic](http://alembic.readthedocs.org/en/latest/)


## SQLAlchemy

The SQLAlchemy exists before Django ([yes before Django](https://github.com/zzzeek/sqlalchemy/commit/ec052c6a1f1fb0236bd367c510d82f076cb67bc9)) and since 2005 we have a team focuses on development of an ORM, unlike Django it's a time to take care of a web framework + ORM (I believe I don't need to talk to a developer focused render more than a developer not focused).

Structure of a model:

```python
class Entity(Base):
    __tablename__ = 'entity'
    id = Column(Integer, Sequence('id_seq'), primary_key=True)
    name = Column(String(50))

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return "<Entity('%d', '%s')>" % (self.id, self.name)
```


## WTForms

A workaround for those who do not use Django and need to work with forms we have the WTForms, was created in [2008](https://github.com/wtforms/wtforms/commit/c0998bac1a4d5cd5fdf43a825529a64e24dea9a5) and maintained until today!

Structure of a form:

```python
class UserForm(Form):
    name = TextField(validators=[DataRequired(), Length(max=100)])
    email = TextField(validators=[DataRequired(), Length(max=255)])
```


## Template Engine

Jinja2 is a modern and designer-friendly templating language for Python, modelled after Django’s templates. It is fast, widely used and secure with the optional sandboxed template execution environment


Structure of a template:

```html
<title>{% block title %}{% endblock %}</title>
<ul>
{% for user in users %}
  <li><a href="{{ user.url }}">{{ user.username }}</a></li>
{% endfor %}
</ul>
```

## Migration

Usage of Alembic starts with creation of the Migration Environment. This is a directory of scripts that is specific to a particular application. The migration environment is created just once, and is then maintained along with the application’s source code itself.


Structure of a migration:

```python
revision = '1975ea83b712'
down_revision = None

from alembic import op
import sqlalchemy as sa

def upgrade():
    pass

def downgrade():
    pass
```

How to make the evolution and downgrade:

```python
def upgrade():
    op.create_table(
        'account',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('description', sa.Unicode(200)),
    )

def downgrade():
    op.drop_table('account')
```

Structure of a alter table:

```python
"""
$ alembic revision -m "Add a column"
"""

revision = 'ae1027a6acf'
down_revision = '1975ea83b712'

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('account', sa.Column('last_transaction_date', sa.DateTime))

def downgrade():
    op.drop_column('account', 'last_transaction_date')
```


## Conclusion

Exactly what you see, everything that Django has found out the stack of Django. I didn't write this blogpost to speak ill of Django and Yes to shows that exist other solutions for full development stack. Many people use Django by not understanding the environment with Python, today the Django brings much ready that makes some developers get lazy and not gain skills of software architecture.

Come help with the Bottle, we are a growing community, to contribute with code of Bottle look at the issue that we have open. In case of doubt we have mailing list and IRC channel.

[GET INVOLVED](http://bottlepy.org/docs/dev/development.html#get-involved)