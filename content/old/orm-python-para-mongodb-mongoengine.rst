ORM Python para MongoDB - MongoEngine
#####################################
:date: 2010-07-03 22:03
:author: avelino
:category: Avelino
:slug: orm-python-para-mongodb-mongoengine

| |image0|
|  O MongoEngine é um ORM para MongoDB escrito em Python, o developer
team do MongoEngine busca trabalhar exatamente igual ao ORM do Django.

Uso o MongoEngine em muitos projetos e ele é o ORM MongoDB oficial do
iGrape Python (Ainda não esta disponivel on-line, estamos terminando os
teste para depois disponibilizar.

O MongoEngine trabalha com o pyMongo, então antes de instalar o
MongoEngine instale o pyMongo.

Chega de blablabla, vamos ao exemplo:

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

| === Using MongoEngine ===
|  See the tutorial

| === MongoEngine Docs ===
|  Link: hmarr.com/mongoengine

::

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

Simples de trabalhar assim né, agora mão na massa vamos migrar nosso
sistema que usa MongoDB para MongoEngine

.. |image0| image:: http://4.bp.blogspot.com/_ovJ6PyiUjqA/TC9R0Z83HoI/AAAAAAAAB60/11VqQHjvOuY/s320/Captura+de+tela+2010-07-03+a%CC%80s+12.06.11.png
