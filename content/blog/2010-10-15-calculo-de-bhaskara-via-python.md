+++
date = "2010-10-15"
title = "Calculo de Bhaskara via Python"
tags = ["python", "matematica", "bhaskara"]
aliases = ["/2010/10/calculo-de-bhaskara-python"]
+++

O foco este post é levar você aprender computação com Python.

Para calcular as raízes em função do segundo grau, utilizamos uma fórmula muito querida por todos que estudam no ensino médio, a famosa fórmula de Bhaskara:

![Calculo de Bhaskara](/blog/bhaskara-1.gif)

Onde cada letra desta fórmula representa os coeficientes da função do segundo grau que queremos resolver. Basta substituir e achar os valores. Podem notar que há um ± no meio da fórmula. Pois é, é daí que irá sair dois resultados: um com o sinal de + e outro com o sinal de -. Veja o exemplo:

![Calculo de Bhaskara](/blog/bhaskara-2.gif)

Neste exemplo temos os coeficientes, a=2, b= -6 e c= -20 (Muita atenção para os sinais)
Agora substituindo na fórmula de Bhaskara:

![Calculo de Bhaskara](/blog/bhaskara-3.gif)

Agora chegamos no momento crucial do cáculo das raízes.
Devemos separar esta conta em duas: uma com o sinal de + e a outra com o sinal de -. Assim:

![Calculo de Bhaskara](/blog/bhaskara-4.gif)

Portanto as duas raízes da função são 5 e -2.

Chega de blablabla e vamos ver como isso fica em Python:

```python
import sys, math

a=input ("a:")
b=input ("b:")
c=input ("c:")
d=(b^2)-(4*a*c) # Mário Meyer
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
```
