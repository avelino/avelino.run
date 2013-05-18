Title: Configurando date.timezone do PHP
Date: 2010-06-23 22:01
Author: avelino
Category: Avelino, php
Tags: date, date.timezone, php, timezone
Slug: configurando-datetimezone-do-php

Quando você instala o php no servidor ele vem com o timezone
em comentário mas tem Framework ou Sistemas que pede isso, bom simples.

Localize o arquivo *php.ini* no seu servidor e ache a linha 
*date.timezone.*  
Pronto agroa coloque ele assim:

    date.timezone = "America/Sao_Paulo" 

Pronto, agora de um restart no seu HTTPD (Apache) e já esta funcionando.
