Title: VIM a IDE para programadores Python
Date: 2011-12-22 22:47
Author: avelino
Category: Avelino
Slug: vim-ide-para-programadores-python

Depois muito tempo sem escrever nada no meu blog, escolhi esse tema para
chamar a atenção do pessoal que esta começando desenvolver em Python que
sempre pergunta qual é a melhor IDE para desenvolver em Python ou qual
quer programador que usa uma super IDE pesado porque tem o recurso X, Y
e Z.

Com o VIM podemos ter todos os recurso avançado que temos em qual quer
IDE, basta algumas configurações para que esses recursos ser ativado,
para facilitar a vida de todos compartilhei o meu `.vimrc` e nesse post
vou explicar como usar o mesmo.

`"Em 2 de novembro de 1991, Bram Moolenaar publicava a primeira versão do edito vim. O vim nasceu como um clone para Amiga do editor vi criado por Bill Joy em 1976, adicionando algumas funcionalidades extras, daí seu nome (VI iMproved ou VI Melhorado). Este editor se adaptou rapidamente a outras plataformas. "`

Assumindo que o `vi` já esta instalado no meu micro, vamos instalar as
configurações que eu fiz, basta rodar os seguintes comando no seu bash
(Linux ou Mac):

    curl https://raw.github.com/avelino/.vimrc/master/bootstrap.sh -o - | sh

Após isso ele vai baixar o repositório na sua pasta `HOME`.  
Recomendo o uso o VIM em GUI pois podemos chegar 256 cores, ou seja,
colocar temas mais agradável e assim deixando o uso do `vim` mais
confortável para o desenvolvimento, para Linux é o `gvim` e para mac o
`macvim` (Para mac o Björn Winckler fez um ótimo trabalho, na minha
humilde opinião é a melhor versão do VIM via GUI).

Chega de blablabla né, vamos logo para o que realmente interessa, como o
`VIM` ficou e como utilizar ele?

![vim start][]

Usando o vim para navegar nas pasta de um projeto:

![vim files][]

Buscando arquivo por nome dentro do projeto:

![vim search file][]

Listar todas as class e def do arquivo esta esta aberto (Python)

![vim list class][]

Lista de comandos para usar no 'vim', lembrando que esses comando foi
customizado:

-   `:cd` /path Abrir pasta
-   `tn` Abrir nova aba
-   `te` Abrir nova aba e carregar arquivo
-   `t]` Proxima aba
-   `t[` Voltar aba
-   `Ctrl+c` Adicionar todos os arquivos no cache para poder fazer busca
    de arquivo (recomendo fazer isso ao abrir o projeto)
-   `Ctrl+f` Busca arquivo e abre na mesma aba
-   `Ctrl+s` Busca arquivo e abre em uma nova aba
-   `\b` Abre arquivo que esta no buffer do vim (Arquivo abertos)
-   `\d`, `\n` ou `F3` Abre navegador de arquivo
-   `\f` Lista todas as class e def (Python)
-   `\j` Vai para declaração de um metodo
-   `\r` Renomear todos os metodos
-   `[e` Move linha para cima
-   `e]` Move linha para baixo
-   `\v ou`Ctrl+w + v\` Divide a tela em vertical
-   `\h` ou `Ctrl+w + s` Divide a tela em horizontal
-   `\w` ou `Ctrl+w + q` Fecha a aba atual
-   `Ctrl+k` Abre console Python
-   `Ctrl+j` Roda o script Python aberto
-   `\sh` Abre bash (shell)
-   `\p` Manda o arquivo em aberto para o dpaste.com
-   `\ga` Git add .
-   `\gc` Git commit
-   `\gsh` Git push
-   `\gs` Git status
-   `\gd` Git diff
-   `\gr` Git remove
-   `\S` Remove todos os espaços do final
-   `\c` Lista controle de versao do buffer

  [vim start]: http://dl.dropbox.com/u/763381/avelino.us/vim-start.png
  [vim files]: http://dl.dropbox.com/u/763381/avelino.us/vim-files.png
  [vim search file]: http://dl.dropbox.com/u/763381/avelino.us/vim-search-files.png
  [vim list class]: http://dl.dropbox.com/u/763381/avelino.us/vim-list-class.png
