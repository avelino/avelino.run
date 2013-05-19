Porque fazer teste unitario em javascript?
##########################################
:date: 2011-07-21 22:45
:author: avelino
:category: Avelino
:slug: porque-fazer-teste-unitario-em-javascript

É complicado confiar em um software que não tem teste unitario. Hoje
estava escrevendo alguns códigos em JavaScript e resolvi escrever esse
post pois muitos desenvolvedores JavaScript não costumam testar seus
códigos.

QUnit é um Framework open source de teste unitário para JavaScript. Ele
foi desenvolvido para fazer teste unitários no desenvolvimento do
próprio Jquery, mas é capaz de testar qualquer código Javascript (Até
mesmo testar código Javascript do lado do servidor NodeJS).

Segue abaixo o exemplo de uma implementação simples:

::

    <html>
    <head>
      <script src="http://code.jquery.com/jquery-latest.js"></script>
      <link rel="stylesheet" href="http://code.jquery.com/qunit/git/qunit.css" type="text/css" media="screen" />
      <script type="text/javascript" src="http://code.jquery.com/qunit/git/qunit.js"></script>
      <script>
        function calc(val1, val2, oper){
          val1 = typeof val1 == 'undefined' ? 0 : val1
          val2 = typeof val2 == 'undefined' ? 0 : val2
          oper = typeof oper == 'undefined' ? "+" : oper

          if(oper == "+")
            cal = val1 + val2
          else if(oper == "-")
            cal = val1 - val2
          else
            cal = false

          return cal
        }
      </script>

      <script>
        $(document).ready(function(){

          module("Test render html")
          test("test valor in #test1", function(){
            equals("ok ok ok", $("#test1").html())
            notEqual("ok ok ok ", $("#test1").html())
          })

          module("Test function calc()")
          test("test basic return 10", function(){
            equals(10, calc(10))
            notEqual(10, calc(11))
          })

          test("test basic sum 2 parameter", function(){
            equals(20, calc(10, 10))
            notEqual(21, calc(10, 10))
            deepEqual(20, calc(10, 10))
            notStrictEqual("20", calc(10, 10))
          })

          test("set operator +", function(){
            equals(20, calc(10, 10, "+"))
            equals(false, calc(10, 10, "..."))
          })

          test("set operator -", function(){
            equals(1, calc(10, 9, "-"))
          })

        })
      </script>

    </head>
    <body>
      <h1 id="qunit-header">QUnit example</h1>
      <h2 id="qunit-banner"></h2>
      <div id="qunit-testrunner-toolbar"></div>
      <h2 id="qunit-userAgent"></h2>
      <ol id="qunit-tests"></ol>
      <div id="qunit-fixture">test markup, will be hidden</div>

      <div id="test1">ok ok ok</div>
    </body>
    </html>

No código acima estou fazendo dois tipos de testes: um módulo de item
renderizado na página, e outro módulo de teste de uma função de cálculo.

| Segue abaixo o print de como ficou o test:
|  |Alt text|

.. |Alt text| image:: http://s1.i1.picplzthumbs.com/upload/img/16/3f/a6/163fa61700835d5c6527f30c407f5815f206e47b_wmlg.jpg
