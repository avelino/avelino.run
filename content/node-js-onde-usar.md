Title: Node.js onde usar?
Date: 2012-04-10 01:13
Author: avelino
Category: Avelino, javascript, nodejs, Python
Tags: cache, JavaScript, Nodejs
Slug: node-js-onde-usar

![][]

Ultimamente estou estudando bastante Javascript para colocar algumas
aplicações em Node.js no ar, ate que tive a minha primeira necessidade
real de usar [Nodejs][].

Na [Nodegrid][] tivemos a necessidade fazer grande processamento
assíncrono, temos um servidor de cache que foi desenvolvimento por
necessidade de armazenamento e controle do que esta em cache e tempo
para expirar o mesmo, poderia ser usado memcache mas a [Nodegrid][] esta
fazendo um serviço de hosting de memcache, com isso teríamos o problema
de concorrência de nome dentro do banco chave e valor (Memcache).

No case que tenho com a [Nodegrid][] na solução de cache (Djazz.cache)
começamos a desenvolver usando 'C', funcionou muito bem, mas com o
passar do tempo a manutenção do software começou ficar trabalhosa. Eu
tenho experiencias com software grande em C [(Kernel BSD)][] e mesmo
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

Link o slide da palestra "[Node.js em produção][]"

  []: http://avelino.us/wp-content/uploads/2012/04/nodejs-300x168.png
    "nodejs"
  [Nodejs]: http://nodejs.org "Node.js project"
  [Nodegrid]: http://nodegrid.com
  [(Kernel BSD)]: http://www.freebsd.org/doc/en_US.ISO8859-1/books/handbook/kernelconfig.html
  [Node.js em produção]: http://www.slideshare.net/avelinoo/nodejs-em-produo-javascript-no-server-side
    "Node.js em produção, javascript no server side"
