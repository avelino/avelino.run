Title: Pilhas com listas de Python
Date: 2010-07-23 22:13
Author: avelino
Category: Avelino
Slug: pilhas-com-listas-de-python

Pilhas com listas de Python

O foco este post é levar você aprender computação com Python.  
As listas de Python são bem parecida com às operações que define uma
pilha.

Segue abaixo um source para explica melhor a implementação "TAD Pilha"

    class Stack :
     def __init__(self) :
      self.items = []

     def push(self, item) :
      self.items.apend(item)

     def pop(self) :
      return self.items.pop()

     def isEmpty(self) :
      return (self.items == [])

Uma pilha é uma estrutura de dados genérica, o que significa que podemos
adicionar qualquer tipo de ítem a ela.

Usando:

    >>> from Stack import *
    >>> start = Stack()
    >>> start.push(50)
    >>> start.push(23)
    >>> start.push("+")
    >>> while not start.isEmpty() :
    ... priint start.pop()

Python é uma otima linguagem para ser academica.
