Title: Plone, por onde começar?
Date: 2012-11-06 18:22
Author: avelino
Category: Avelino, Plone, Python
Tags: bootstart, começar, plone, pontape inicial
Slug: plone-por-onde-comecar

[Plone][] é um CMS (Content management system, ou seja, sistema de
gestão de conteúdo), no Brasil muito usado no Governo (saiba mais porque
o Governo Brasileiro selecionou Plone como sistema de gestão de
conteúdo, [palestra][] do Giuseppe Romagnolli na [Plone Symposium][]).

Por onde começa?
----------------

> Como estou usando uma maquina Linux vou explicar como subir o Plone em
> ambiente Unix.

Iremos usar versão **4.2.2** (*estável*) do Plone, para começa
precisamos baixar o source do Plone e descompactar:

[gist id=4027305]

Antes de instalar o Plone precisamos instalar alguns pacote no Linux,
como:

-   python-distribute
-   python-dev
-   build-essential
-   libssl-dev
-   libxml2-dev
-   libxslt1-dev
-   libbz2-dev
-   subversion
-   git

<div>
Como o Plone trabalha com a biblioteca PIL precisamos instalar recurso
para trabalhar com imagem:

</div>
<div>
</div>
<div>
-   libjpeg62-dev
-   libreadline-gplv2-dev
-   wv
-   poppler-utils
-   python-imaging

[gist id=4027365]

Após a instalação das dependências do Plone, vamos começa a realmente
interagir com o Plone. Agora precisamos instalar o Plone, existe dois
modelo de Plone, um onde instalamos a instancia Plone e outra que
instalamos um Cluster de ZEO (ambiente de produção que precisa isolar
ZEO do Plone):

[gist id=4027418]

No final da instalação do Plone o mesmo vai retorna algumas informações
importante como a senha do usuário Administrador do Zope, pasta que foi
instalado o Plone, informações para suporte (da comunidade) e etc.

[gist id=4027449]

Agora depois do Plone instalado queremos subir um site:

[gist id=4027496]

Temos o Zope/Plone rodando na porta **8080** liberado para todos os IP
de sua maquina, ao acessar o endereço no
browser **http://127.0.0.1:8080/** veremos esse site:

[![Plone (rodando) sem nem um Plone Site criado][]][]

Precisamos criar um Plone Site, para isso basta clicar no botão "Criar
um novo site Plone, após clicar você será redirecionado para uma pagina
onde deve preencher com nome e titulo do site, abaixo dessas duas
informações temos a lista de produtos (para quem vem de outro CMS
geralmente é chamado de Plugin) instalados no Plone. Como estamos
começando agora vamos deixar todos em branco e clicar em **Criar site
Plone**.

[![Criar um site Plone][]][]

Após clicar no botão você acabou de criar o seu Plone Site.

[![Bem vindo ao Plone Site][]][]

Agora basta você colocar conteúdo em seu Plone Site.

Comunidade Plone Brasil
-----------------------

No Brasil temos a comunidade [PloneGov-BR][].

</div>

  [Plone]: http://plone.org/
  [palestra]: http://blip.tv/plone-symposium-south-america-/plonegov-uso-de-solu%C3%A7%C3%B5es-plone-na-administra%C3%A7%C3%A3o-p%C3%BAblica-3298083
  [Plone Symposium]: http://www.plonesymposium.com.br/
  [Plone (rodando) sem nem um Plone Site criado]: http://avelino.us/wp-content/uploads/2012/11/plone-sem-nem-um-plone-site-criado-1024x570.png
    "plone-sem-nem-um-plone-site-criado"
  [![Plone (rodando) sem nem um Plone Site criado][]]: http://avelino.us/wp-content/uploads/2012/11/plone-sem-nem-um-plone-site-criado.png
  [Criar um site Plone]: http://avelino.us/wp-content/uploads/2012/11/criar-um-site-plone-1024x1024.png
    "criar-um-site-plone"
  [![Criar um site Plone][]]: http://avelino.us/wp-content/uploads/2012/11/criar-um-site-plone.png
  [Bem vindo ao Plone Site]: http://avelino.us/wp-content/uploads/2012/11/bem-vindo-ao-plone-site-885x1024.png
    "bem-vindo-ao-plone-site"
  [![Bem vindo ao Plone Site][]]: http://avelino.us/wp-content/uploads/2012/11/bem-vindo-ao-plone-site.png
  [PloneGov-BR]: http://plone.org.br/
    "Site da comunidade Plone Brasileira"
