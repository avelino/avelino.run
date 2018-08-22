+++
date = "2011-03-28"
title = "Trabalhando com Python e MongoDB"
tags = ["saint", "vim", "church", "editor"]
aliases = ["/2011/03/trabalhando-com-python-e-mongodb"]
+++

Hoje MongoDB está começando ficar bem comentado na internet (famosos Database NoSQL). Tenho bastante aplicações em produção trabalhando com MongoDB e outros database NoSQL ambas escrita em Python, vou escrever um pouco como usar o MongoDB na linguagem Python.

Como em qualquer outra linguagem, não tem muito segredo. No Python temos a LIB chamada PyMongo, que simplifica muito o trabalho do programador.

Contando que o PyMongo já estejá instalado, seguimos em frente.

Como fazer um conexão:

```python
from pymongo import Connection
connection = Connection()
```

OU

```python
connection = Connection('localhost', 27017)
```

Usar/Criar um Database (no contexto do MongoDB damos o nome de **collection**):

```python
db = connection.forum_database
```

OU

```python
db = connection['forum-database']
```


O MongoDB usa um formato jSON para sua syntax, veja abaixo:

```python
forum = {"author": "Thiago Avelino",
         "text": "Python e MongoDB",
         "tags": ["mongodb", "python", "pymongo"]}
```


Inserindo em um Documento, usando o método insert():

```python
imaster = db.imaster
imaster.insert(forum)
```
> ObjectId('4c7400f42d73303fd2000000')


Após rodar o insert() ele criou um documento fisico no servidor, podemos ver este registro da seguinte forma:

```python
db.collection_names()
```
> [u'imaster', u'system.indexes']


Selecionando apenas um documento com find_one()

```python
imaster.find_one()
```
> {u'text': u'Python e MongoDB', u'_id': ObjectId('4c7400f42d73303fd2000000'), u'author': u'Thiago Avelino', u'tags': [u'mongodb', u'python', u'pymongo']}


Filtrando, usando condições para selecionar:

```python
imaster.find_one({"author": "Thiago Avelino"})
```
> {u'text': u'Python e MongoDB', u'_id': ObjectId('4c7400f42d73303fd2000000'), u'author': u'Thiago Avelino', u'tags': [u'mongodb', u'python', u'pymongo']}


Contando:

```python
imaster.count()
```
> 1


Temos também alguns ORM Python que trabalha com o MongoDB, um exemplo

> System Message: WARNING/2 (<string>, line 86)
> Line block ends without a blank line.

é o MongoEngine que trabalha exatamente igual o ORM do Django. | Veja um exemplo usando MongoEngine:

```python
class BlogPost(Document):
    title = StringField(required=True, max_length=200)
    posted = DateTimeField(default=datetime.datetime.now)
    tags = ListField(StringField(max_length=50))

class TextPost(BlogPost):
    content = StringField(required=True)

class LinkPost(BlogPost):
    url = StringField(required=True)

# Create a text-based post
>>> post1 = TextPost(title='Using MongoEngine', content='See the tutorial')
>>> post1.tags = ['mongodb', 'mongoengine']
>>> post1.save()

# Create a link-based post
>>> post2 = LinkPost(title='MongoEngine Docs', url='hmarr.com/mongoengine')
>>> post2.tags = ['mongoengine', 'documentation']
>>> post2.save()

# Iterate over all posts using the BlogPost superclass
>>> for post in BlogPost.objects:
...     print '===', post.title, '==='
...     if isinstance(post, TextPost):
...         print post.content
...     elif isinstance(post, LinkPost):
...         print 'Link:', post.url
...     print
...

>>> len(BlogPost.objects)
2
>>> len(HtmlPost.objects)
1
>>> len(LinkPost.objects)
1

# Find tagged posts
>>> len(BlogPost.objects(tags='mongoengine'))
2
>>> len(BlogPost.objects(tags='mongodb'))
1
```
