Node.js onde usar?
##################
:date: 2012-04-10 01:13
:author: avelino
:category: Avelino, javascript, nodejs, Python
:tags: cache, JavaScript, Nodejs
:slug: node-js-onde-usar

|image0|

Ultimamente estou estudando bastante Javascript para colocar algumas
aplicações em Node.js no ar, ate que tive a minha primeira necessidade
real de usar `Nodejs`_.

Na `Nodegrid`_ tivemos a necessidade fazer grande processamento
assíncrono, temos um servidor de cache que foi desenvolvimento por
necessidade de armazenamento e controle do que esta em cache e tempo
para expirar o mesmo, poderia ser usado memcache mas a `Nodegrid`_ esta
fazendo um serviço de hosting de memcache, com isso teríamos o problema
de concorrência de nome dentro do banco chave e valor (Memcache).

No case que tenho com a `Nodegrid`_ na solução de cache (Djazz.cache)
começamos a desenvolver usando 'C', funcionou muito bem, mas com o
passar do tempo a manutenção do software começou ficar trabalhosa. Eu
tenho experiencias com software grande em C `(Kernel BSD)`_ e mesmo
assim a manutenção de um software não é nada confortável. Migrei para
Python com Twisted, mais infelizmente o códigos usando Twisted não fica
muito agradável ou seja não é Pythônico então olhei para o projeto
Node.js que tem a característica simples e facil de trabalhar com
processamento assíncrono.

Recomendo olhar o trabalho que os commiters do Node.js estão fazendo,
tem muitas ideias ótimas e outra que precisa ser melhoradas.

Vejo a Node.js como uma solução ótima e simples para trabalhar com
conexões assíncrono, ainda hoje não vejo o Node.js substituindo uma
linguagem que já esta a anos rodando em backend como Python, Ruby, Java
e etc. Ao meu ver o Node.js vai crescer ainda mais o seu uso nas
necessidades específica (assíncronas), pela simplicidade de
implementação e fácil manutenção.

Link o slide da palestra "`Node.js em produção`_\ "

.. _Nodejs: http://nodejs.org
.. _Nodegrid: http://nodegrid.com
.. _(Kernel BSD): http://www.freebsd.org/doc/en_US.ISO8859-1/books/handbook/kernelconfig.html
.. _Node.js em produção: http://www.slideshare.net/avelinoo/nodejs-em-produo-javascript-no-server-side

.. |image0| image:: http://avelino.us/wp-content/uploads/2012/04/nodejs-300x168.png
