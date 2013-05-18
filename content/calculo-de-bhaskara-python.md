Title: Calculo de Bhaskara via Python
Date: 2010-10-15 22:31
Author: avelino
Category: Avelino
Slug: calculo-de-bhaskara-python

O foco este post é levar você aprender computação com Python.

Para calcular as raízes em função do segundo grau, utilizamos uma
fórmula muito querida por todos que estudam no ensino médio, a famosa
fórmula de Bhaskara:

<div class="separator" style="clear: both; text-align: center;">
![][]

</div>
Onde cada letra desta fórmula representa os coeficientes da função do
segundo grau que queremos resolver. Basta substituir e achar os valores.
Podem notar que há um ± no meio da fórmula. Pois é, é daí que irá sair
dois resultados: um com o sinal de + e outro com o sinal de -. Veja o
exemplo: ![][1]

Neste exemplo temos os coeficientes, a=2, b= -6 e c= -20 (Muita atenção
para os sinais)  
Agora substituindo na fórmula de Bhaskara:  
![][2]  
![][3]

Agora chegamos no momento crucial do cáculo das raízes.  
Devemos separar esta conta em duas: uma com o sinal de + e a outra com
o sinal de -. Assim:  
![][4]  
![][5]

Portanto as duas raízes da função são 5 e -2.

Chega de blablabla e vamos ver como isso fica em Python:


    import math
    import sys
    a=input ("a:")
    b=input ("b:")
    c=input ("c:")
    d=(b^2)-(4*a*c) #Mário Meyer
    # d=((b^2)-4*a)*c Esta errado esta linha, usar a linha superior.
    if d<0 :
            print ("Delta negativo, raiz impossivel de ser extraida.") 
            sys.exit()

    else : print "Delta: %s." % d 
            m1=math.sqrt(d)
            x1=(-b+m1)/(2*a)
            x2=(-b-m1)/(2*a)
            print "Raiz ~ X1= %s." % x1
            print "Raiz ~ X2= %s." % x2

  []: http://4.bp.blogspot.com/_ovJ6PyiUjqA/TLg2zSDpNxI/AAAAAAAACHo/m6HjI7z2Bbw/s1600/bascara.gif
  [1]: http://2.bp.blogspot.com/_ovJ6PyiUjqA/TLg3Mno-jMI/AAAAAAAACHs/fCi8z113i4A/s1600/mimetex.cgi.gif
  [2]: http://1.bp.blogspot.com/_ovJ6PyiUjqA/TLg3lDJsNXI/AAAAAAAACHw/YfVQ7BZRn74/s1600/mimetex.cgi+(1).gif
  [3]: http://3.bp.blogspot.com/_ovJ6PyiUjqA/TLg3ldF6RYI/AAAAAAAACH0/n_ovlQqZx58/s1600/mimetex.cgi+(2).gif
  [4]: http://3.bp.blogspot.com/_ovJ6PyiUjqA/TLg4Jje6jmI/AAAAAAAACH4/_KTwfrBiiCM/s1600/mimetex.cgi+(3).gif
  [5]: http://1.bp.blogspot.com/_ovJ6PyiUjqA/TLg4KASi2OI/AAAAAAAACH8/b75a_dgty6s/s1600/mimetex.cgi+(4).gif
