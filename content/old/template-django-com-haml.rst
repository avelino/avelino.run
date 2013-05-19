Template Django com Haml
########################
:date: 2011-05-28 22:44
:author: avelino
:category: Avelino
:slug: template-django-com-haml

`Haml`_ (HTML Abstraction Markup Language) é uma linguagem simples, que
é usado para descrever XHTML de qualquer documento web sem precisar
ficar abrindo e fechando tags HTML. Ele foi projetado para resolver
muitos dos problemas de templates, bem como fazer marcação tão elegante
como ela pode ser.

Em Python temos a biblioteca `HamlPy`_ ela pega os files HAML e gera o
HTML para usarmos em nossos sistemas.

Vamos logo para a pratica, chega de lero lero.

::

    %html{'xmlns':"http://www.w3.org/1999/xhtml", 'lang':"en", "xml:lang":"en"}
      %head

        %title Testando Haml

        %style{'type': 'text/css'}
          body{font-family: verdana;}

        %script{'type':'text/javascript', 'src':'https://www.google.com/jsapi?key=ABQIAAAAUgaJsDgRTDbR5vvhnJ3iYBT2yXp_ZAY8_ufC3CFXhHIE1NvwkxS2j2XMXVpjyqg8A7TkHl2W04abvA'}
        %script{'type': 'text/javascript'}
          google.load("jquery", "1.6.1");

      %body
        #header
          %h1#lero
            .test Haml
            %ul.navigation
              - for run in varloop
                %li= run
        #content
          Testando para ver se funciona o HamlPy

Esse é um layout feito com haml, é muito simples pois não precisamos
ficar fechando as tags, assim os erros de html é 100% resolvido, como
converte o haml para html:

::

    /Users/avelino/.virtualenvs/haml/bin/hamlpy template/index.haml template/index.html

O binario *hamlpy* recebe dois parâmetros o primeiro é o input file haml
o segunda é o output a saída html, depois de rodarmos o hamlpy temos uma
saida da seguinte forma:

::

    <html lang='en' xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'>
      <head>
        <title>Testando Haml</title>
        <style type='text/css'>
          body{font-family: verdana;}
        </style>
        <script src='https://www.google.com/jsapi?key=ABQIAAAAUgaJsDgRTDbR5vvhnJ3iYBT2yXp_ZAY8_ufC3CFXhHIE1NvwkxS2j2XMXVpjyqg8A7TkHl2W04abvA' type='text/javascript'></script>
        <script type='text/javascript'>
          google.load("jquery", "1.6.1");
        </script>
      </head>
      <body>
        <div id='header'>
          <h1 id='lero'>
            <div class='test'>Haml</div>
            <ul class='navigation'>
              {% for run in varloop %}
                <li>{{ run }}</li>
              {% endfor %}
            </ul>
          </h1>
        </div>
        <div id='content'>
          Testando para ver se funciona o HamlPy
        </div>
      </body>
    </html>

Minha views do Django declaro sempre com o arquivo .html que foi gerado
com o hamlpy. Veja como ficou o meu views:

::

    # -*- coding: utf-8 -*-
    """
        views

        :copyright: (c) 2011 by the Avelino Labs, see Thiago Avelino <thiago@avelino.us> for more details.
        :license: BSD, see LICENSE for more details.
    """

    from django.shortcuts import render_to_response
    from django.template import RequestContext

    def index(request):
        return render_to_response(
                'index.html',
                context_instance=RequestContext(request))

.. _Haml: http://haml-lang.com/
.. _HamlPy: https://github.com/jessemiller/HamlPy
