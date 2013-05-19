Configurando date.timezone do PHP
#################################
:date: 2010-06-23 22:01
:author: avelino
:category: PHP
:tags: date, date.timezone, php, timezone
:slug: configurando-datetimezone-do-php

Quando você instala o php no servidor ele vem com o timezone
em comentário mas tem Framework ou Sistemas que pede isso, bom simples.

| Localize o arquivo *php.ini* no seu servidor e ache a linha 
*date.timezone.*
|  Pronto agroa coloque ele assim:

::

    date.timezone = "America/Sao_Paulo" 

Pronto, agora de um restart no seu HTTPD (Apache) e já esta funcionando.
