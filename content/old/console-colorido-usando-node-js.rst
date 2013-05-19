Console colorido usando Node.js
###############################
:date: 2012-07-27 11:40
:author: avelino
:category: javascript
:slug: console-colorido-usando-node-js

Para quem esta acostumado trabalhar com make para subir um ambiente ou o
pessoal que gosta de escrever alguns shell scripts para automação de
simples rotinas acho muito importante colocar cor nos retornos do
script, isso é ótimo para sinalizar o que realmente o software (ou
script) esta fazendo.

Para deixar um retorno colorido usando Node.js não é muito diferente de
shell script, pois o que vai processar o retorno é um console bash (zsh
ou qual quer outro shell), veja o exemplo abaixo de como deixar um
retorno de shell script colorido:

.. code-block:: sh

    echo -e " \033[0;30m Preto  \033[0m             --> 0;30 "
    echo -e " \033[0;31m Vermelho  \033[0m          --> 0;31 "
    echo -e " \033[0;32m Verde  \033[0m             --> 0;32 "
    echo -e " \033[0;33m Marrom  \033[0m            --> 0;33 "
    echo -e " \033[0;34m Azul  \033[0m              --> 0;34 "
    echo -e " \033[0;35m Purple  \033[0m            --> 0;35 "
    echo -e " \033[0;36m Cyan  \033[0m              --> 0;36 "
    echo -e " \033[0;37m Cinza Claro  \033[0m       --> 0;37 "
    echo -e " \033[1;30m Preto Acinzentado \033[0m  --> 1;30 "
    echo -e " \033[1;31m Vermelho Claro  \033[0m    --> 1;31 "
    echo -e " \033[1;32m Verde Claro  \033[0m       --> 1;32 "
    echo -e " \033[1;33m Amarelo \033[0m            --> 1;33 "
    echo -e " \033[1;34m Azul  Claro \033[0m        --> 1;34 "
    echo -e " \033[1;35m Purple Claro  \033[0m      --> 1;35 "
    echo -e " \033[1;36m Cyan  Claro \033[0m        --> 1;36 "
    echo -e " \033[1;37m Branco  \033[0m            --> 1;37 "

    echo -e " \033[40;1;37m Fundo Preto    \033[0m     --> 40;?;? "
    echo -e " \033[41;1;37m Fundo Vermelho \033[0m     --> 41;?;? "
    echo -e " \033[42;1;37m Fundo Verde    \033[0m     --> 42;?;? "
    echo -e " \033[43;1;37m Fundo Marrom   \033[0m     --> 43;?;? "
    echo -e " \033[44;1;37m Fundo Azul     \033[0m     --> 44;?;? "
    echo -e " \033[45;1;37m Fundo Purple   \033[0m     --> 45;?;? "
    echo -e " \033[46;1;37m Fundo Cyan     \033[0m     --> 46;?;? "
    echo -e " \033[47;1;37m Fundo Cinza    \033[0m     --> 47;?;? "

    echo -e " \033[4;30m Sublinhado  \033[0m        --> 4;? "
    echo -e " \033[5;30m Piscando    \033[0m        --> 5;? "
    echo -e " \033[7;30m Invertido   \033[0m        --> 7;? "
    echo -e " \033[8;30m Concealed   \033[0m        --> 8;? "


|image0|

Bom como comentei acima em Node.js não é muito diferente, seja exemplo
abaixo:

.. code-block:: js

    'use strict';
    //// http://avelino.us/2012/07/27/console-colorido-usando-node-js
    ////

    // Retorna o texto em vermelho
    console.log("\033[31m Aqui esta o texto em vermelho.")

    // Retorna o texto em azul
    console.log("\033[34m Aqui esta o texto em azul.")

    // Volta o padrão do bash
    console.log("\033[0m Aqui estamos dando reset nas cores do bash.")


    // Criando variavel para deixar um pouco mais simples
    var red, blue, reset;
    red   = '\u001b[31m';
    blue  = '\u001b[34m';
    reset = '\u001b[0m';

    console.log(red +"Aqui esta o texto em vermelho. "+ blue +"Aqui esta o texto em vermelho. "+ reset +"Aqui estamos dando reset nas cores do bash.")


|image1|

Perceba que no começo do script estamos usando o
"**``'use strict';``**\ ", para não termos problema com o formato loco
de color dentro das strings. No exemplo que estamos
usando variáveis coloquei as colors em Unicode (eis ai uma problema!).

Porque uso "**\\u**\ " nos códigos unicode?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Bom realmente eu não entendi muito bem o porque o Node.js trata dessa
forma, mas achei uma essa explicação:

    | Octal literals can be identified by a numeric value starting with
    a leading 0 (zero). Since this is a source of a possible
    unintentional octal values when the programmer zero-pads decimal
    numbers of varying lengths in the source code to make then look
    prettier and more uniform. The strict mode disallows the octal mode
    due to this reason.
    |  The ESCape code can be represented in a number of ways. Decimal
    27 , Hexadecimal 1B , Octal 33 or Binary 00011011.
    |  So instead of write the ESC code in a string as \\033 you can as
    well just choose one of the other modes. Hexadecimal for instance:
    \\x1B.
    |  In your example you used the two-byte unicode representation of
    the character \\u001b which works just as well.
    |  I’m still an oldschool C head and usually assumes all strings to
    be plain ASCII so I’d use \\x1B by default instead of this
    newfangled unicode crap Java is using. ^\_^

Realmente não é muito produtivo desenvolver dessa forma, mas temos
algumas iniciativas open source que pode nos ajudar com o retorno de
cores dentro do Node.js.

-  `cli-color`_ - `Mariusz Nowak`_
-  `colorize`_ - `Matt Patenaude`_
-  `sty`_ - `Trevor Burnham`_ (*Esse projeto aceita você coloca objetos
   html como marcação*)

Todos os projetos acima estão dentro do npm.

.. _cli-color: https://github.com/medikoo/cli-color
.. _Mariusz Nowak: https://github.com/medikoo
.. _colorize: https://github.com/mattpat/colorize
.. _Matt Patenaude: http://mattpatenaude.com/
.. _sty: https://github.com/TrevorBurnham/sty
.. _Trevor Burnham: https://github.com/TrevorBurnham

.. |image0| image:: http://avelino.us/wp-content/uploads/2012/07/Screen-Shot-2012-07-27-at-11.30.08-AM-300x300.png
   :target: http://avelino.us/wp-content/uploads/2012/07/Screen-Shot-2012-07-27-at-11.30.08-AM.png
.. |image1| image:: http://avelino.us/wp-content/uploads/2012/07/Screen-Shot-2012-07-27-at-11.31.42-AM-300x225.png
   :target: http://avelino.us/wp-content/uploads/2012/07/Screen-Shot-2012-07-27-at-11.31.42-AM.png
