Title: Python Web ou Django (Framework MVC Design Pattern)
Date: 2010-05-25 21:55
Author: avelino
Category: Avelino
Slug: python-web-ou-django-framework-mvc-design-pattern

Bom hoje temos alguns Framework (MVC) Python na web, vou estar
comparando o source Python Web com Django, simplesmente ficou mais
somples.

Python Web:

    #!/usr/bin/python

    import MySQLdb

    print "Content-Type: text/html"
    print
    print "<title>Books</title>"
    print ""
    print "<h1>Books</h1>"
    print "<ul>"
    connection = MySQLdb.connect(user='me', passwd='letmein', db='my_db')
    cursor = connection.cursor()
    cursor.execute("SELECT name FROM books ORDER BY pub_date DESC LIMIT 10")
    for row in cursor.fetchall():
        print "<li>%s</li>" % row[0]
    print "</ul>"
    print ""
    connection.close()

Django (MVC Design Pattern):

    # models.py (the database tables)

    from django.db import models

    class Book(models.Model):
        name = models.CharField(maxlength=50)
        pub_date = models.DateField()

    # views.py (the business logic)

    from django.shortcuts import render_to_response
    from models import Book

    def latest_books(request):
        book_list = Book.objects.order_by('-pub_date')[:10]
        return render_to_response('latest_books.html', {'book_list': book_list})

    # urls.py (the URL configuration)

    from django.conf.urls.defaults import *
    import views

    urlpatterns = patterns('',
        (r'latest/$', views.latest_books),
    )

    # latest_books.html (the template)

    <title>Books</title>

    <h1>Books</h1><ul>{% for book in book_list %}
    <li>{{ book.name }}</li>
    {% endfor %} </ul>
