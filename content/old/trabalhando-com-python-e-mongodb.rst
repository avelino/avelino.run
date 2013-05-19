Trabalhando com Python e MongoDB
################################
:date: 2011-03-28 22:40
:author: avelino
:category: Python
:slug: trabalhando-com-python-e-mongodb

Hoje MongoDB está começando ficar bem comentado na internet (famosos
Database NoSQL). Tenho bastante aplicações em produção trabalhando com
MongoDB e outros database NoSQL ambas escrita em Python, vou escrever um
pouco como usar o MongoDB na linguagem Python.

Como em qualquer outra linguagem, não tem muito segredo. No Python temos
a LIB chamada PyMongo, que simplifica muito o trabalho do programador.

Contando que o PyMongo já estejá instalado, seguimos em frente.

Como fazer um conexão:

::

    >>> from pymongo import Connection
    >>> connection = Connection()

OU

::

    >>> connection = Connection('localhost', 27017)

| Usar/Criar um Database:
|  >>> db = connection.forum\_database

OU

::

    >>> db = connection['forum-database']

O MongoDB usa um formato jSON para sua syntax, veja abaixo:

::

    >>> forum = {"author": "Thiago Avelino",
    ...         "text": "Python e MongoDB",
    ...         "tags": ["mongodb", "python", "pymongo"]}

Inserindo em um Documento, usando o método insert():

::

    >>> imaster = db.imaster
    >>> imaster.insert(forum)
    ObjectId('4c7400f42d73303fd2000000')

Após rodar o insert() ele criou um documento fisico no servidor, podemos
ver este registro da seguinte forma:

::

    >>> db.collection_names()
    [u'imaster', u'system.indexes']

Selecionando apenas um documento com find\_one()

::

    >>> imaster.find_one()
    {u'text': u'Python e MongoDB', u'_id': ObjectId('4c7400f42d73303fd2000000'), u'author': u'Thiago Avelino', u'tags': [u'mongodb', u'python', u'pymongo']}

Filtrando, usando condições para selecionar:

::

    >>> imaster.find_one({"author": "Thiago Avelino"})
    {u'text': u'Python e MongoDB', u'_id': ObjectId('4c7400f42d73303fd2000000'), u'author': u'Thiago Avelino', u'tags': [u'mongodb', u'python', u'pymongo']}

Contando:

::

    >>> imaster.count()
    1

| Temos também alguns ORM Python que trabalha com o MongoDB, um exemplo
é o MongoEngine que trabalha exatamente igual o ORM do Django.
|  Veja um exemplo usando MongoEngine:

::

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
    === Using MongoEngine ===
    See the tutorial

    === MongoEngine Docs ===
    Link: hmarr.com/mongoengine

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

