# Corretor Ortográfico no VIM

- date: 2013-12-07
- tags: open-source, vim, libreoffice, vero
- public: true

VIM muito além do editor de texto de console!
-------

![Corretor Ortográfico dentro do VIM](/media/vim-libreoffice-vero.png)

Desde 2007 escrevo aqui no meu blog, com isso já passei por diversas plataforma
de blog (Blogspot, Wordpress, Django, [Django
Diario](https://bitbucket.org/semente/django-diario),
[Pelican](http://docs.getpelican.com/), entre outras), hoje estou
usando [liquidluck](http://liquidluck.readthedocs.org/en/latest/index.html)
(ferramenta escrita em Tornado Python para gerar arquivos estático), minha
escolha para essa mudança foi simplificar o processo de escrever texto, ou
seja, usar o que eu uso no dia a dia para programar, com isso tive algumas
perda como corretor ortográfo!

Olhando o [LibreOffice](http://www.libreoffice.org/) achei o plugin chamado [VERO – VERificador
Ortográfico](http://pt-br.libreoffice.org/projetos/projeto-vero-verificador-ortografico/),
e para mim seria excelente ter ele dentro do VIM, pois bem consegui fazer o que
eu queria, usar o VERO dentro do VIM.


## Instalando o VERO

Primeiro precisamos baixar o *plugin* VERO (vou criar uma pasta dentro do
/var/tmp para deixar centralizado os arquivos) e descompactar

    mkdir /var/tmp/vero
	cd /var/tmp/vero
	wget
	http://extensions.libreoffice.org/extension-center/vero-verificador-ortografico-e-hifenizador-em-portugues-do-brasil/pscreleasefolder.2012-01-04.1563120832/2.1/vero_pt_br_v210aoc.oxt
	unzip -x vero_pt_br_v210aoc.oxt

Abra o `vim` e digite:

    mkspell pt pt_BR 

Precisamos colocar um configuração dentro com seu `.vimrc`:

	echo 'set spell spelllang=pt' >> ~/.vimrc

Precione enter até acabar todas as perguntas e pronto você tem o VERO instalado
dentro do seu VIM, agora basta usar o corretor ortográfo!

Veja alguns comando do corretor ortográfico,
[aqui](https://github.com/avelino/.vimrc#commands-1)!

Se você gosta de VIM de uma olhada na configuração que eu mantenho
[https://github.com/avelino/.vimrc](https://github.com/avelino/.vimrc)!
