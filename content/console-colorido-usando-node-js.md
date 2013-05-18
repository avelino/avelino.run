Title: Console colorido usando Node.js
Date: 2012-07-27 11:40
Author: avelino
Category: Avelino, javascript, nodejs
Slug: console-colorido-usando-node-js

Para quem esta acostumado trabalhar com make para subir um ambiente ou o
pessoal que gosta de escrever alguns shell scripts para automação de
simples rotinas acho muito importante colocar cor nos retornos do
script, isso é ótimo para sinalizar o que realmente o software (ou
script) esta fazendo.

Para deixar um retorno colorido usando Node.js não é muito diferente de
shell script, pois o que vai processar o retorno é um console bash (zsh
ou qual quer outro shell), veja o exemplo abaixo de como deixar um
retorno de shell script colorido:

[gist id=3188137]

[![][]][]

Bom como comentei acima em Node.js não é muito diferente, seja exemplo
abaixo:

[gist id=3188205]

[![][1]][]

Perceba que no começo do script estamos usando o "**`'use strict';`**",
para não termos problema com o formato loco de color dentro das strings.
No exemplo que estamos usando variáveis coloquei as colors em Unicode
(eis ai uma problema!).

### Porque uso "**\\u**" nos códigos unicode?

Bom realmente eu não entendi muito bem o porque o Node.js trata dessa
forma, mas achei uma essa explicação:

> Octal literals can be identified by a numeric value starting with a
> leading 0 (zero). Since this is a source of a possible unintentional
> octal values when the programmer zero-pads decimal numbers of varying
> lengths in the source code to make then look prettier and more
> uniform. The strict mode disallows the octal mode due to this reason.  
>  The ESCape code can be represented in a number of ways. Decimal 27 ,
> Hexadecimal 1B , Octal 33 or Binary 00011011.  
>  So instead of write the ESC code in a string as \\033 you can as well
> just choose one of the other modes. Hexadecimal for instance: \\x1B.  
>  In your example you used the two-byte unicode representation of the
> character \\u001b which works just as well.  
>  I’m still an oldschool C head and usually assumes all strings to be
> plain ASCII so I’d use \\x1B by default instead of this newfangled
> unicode crap Java is using. \^\_\^

Realmente não é muito produtivo desenvolver dessa forma, mas temos
algumas iniciativas open source que pode nos ajudar com o retorno de
cores dentro do Node.js.

-   [cli-color][] - [Mariusz Nowak][]
-   [colorize][] - [Matt Patenaude][]
-   [sty][] - [Trevor Burnham][] (*Esse projeto aceita você coloca
    objetos html como marcação*)

Todos os projetos acima estão dentro do npm.

  []: http://avelino.us/wp-content/uploads/2012/07/Screen-Shot-2012-07-27-at-11.30.08-AM-300x300.png
    "Screen Shot 2012-07-27 at 11.30.08 AM"
  [![][]]: http://avelino.us/wp-content/uploads/2012/07/Screen-Shot-2012-07-27-at-11.30.08-AM.png
  [1]: http://avelino.us/wp-content/uploads/2012/07/Screen-Shot-2012-07-27-at-11.31.42-AM-300x225.png
    "Screen Shot 2012-07-27 at 11.31.42 AM"
  [![][1]]: http://avelino.us/wp-content/uploads/2012/07/Screen-Shot-2012-07-27-at-11.31.42-AM.png
  [cli-color]: https://github.com/medikoo/cli-color
  [Mariusz Nowak]: https://github.com/medikoo
  [colorize]: https://github.com/mattpat/colorize
  [Matt Patenaude]: http://mattpatenaude.com/
  [sty]: https://github.com/TrevorBurnham/sty
  [Trevor Burnham]: https://github.com/TrevorBurnham
