Problema com hashlib + md5 (Python 2.7)
#######################################
:date: 2011-10-04 22:46
:author: avelino
:category: Avelino, Python
:slug: problema-com-hashlib-md5-python-27

Estava com o seguinte problema "Error: No module named \_md5",
primeiramente pensei que fosse problema de de compilação do Python, mas
olhando o problema proximo achei alguns artigo falando desse problema e
um deles estava no `bug.python.org`_

A solução que cheguei foi, criar uma lib chamada "\_md5", criei um
arquivo chamado "\_md5py":

::

    class _md5:
        def __init__():
            import md5
            return md5

Lendo as documentação vi que a lib "hashlib.\_md5" foi deprecada pois a
md5 ficou no lugar. Espero que ajude outras pessoas que esta com esse
problema.

.. _bug.python.org: http://bugs.python.org/msg109485
