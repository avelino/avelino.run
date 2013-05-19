Criando sistema com Multithreaded em Python
###########################################
:date: 2011-04-01 22:43
:author: avelino
:category: Python
:slug: criando-sistema-com-multithreaded-em-python

Multithreaded é quando temos mais de um programa executando ao mesmo
tempo, totalmente diferente de executar duas vez o mesmo programa, com
"threads" o sistema vai ser executado apenas uma vez e via thread vai
processar mais de uma função ao mesmo tempo, isso é necessario para
concorrência em sistema.

Algumas vantagens de trabalha com threads:

-  Múltiplos processo ao mesmo tempo e pode, portanto, compartilhar
   informações e comunicar uns com os outros mais facilmente do que se
   fossem processos separados;
-  Menos consumo de memória, pois o mesmo vai consumir mais CPU.

Uma thread tem um começo, meio e fim, assim podemos colocar um ponteiro
de instrução para acompanhar onde esta sendo processado cada thread
dentro de seu contexto.

-  Ela pode ser antecipada (interrompido);
-  Pode ser temporariamente suspensos (também conhecido como sleep),
   enquanto outros segmentos estão em execução - isso é chamado de
   rendimento.

Iniciando uma nova Thread:

::

    #!/usr/bin/python
    # -*- coding: UTF-8 -*-

    import thread
    import time

    # Definição da função de thread
    def print_time( name, delay):
        count = 0
        while count < 5:
            time.sleep(delay)
            count += 1
            print "%s: %s" % ( name, time.ctime(time.time()) )

    # Criar dois tópicos
    try:
        thread.start_new_thread( print_time, ("Thread-1", 2, ) )
        thread.start_new_thread( print_time, ("Thread-2", 4, ) )
    except:
        print "Erro: não conseguiu iniciar a thread"

    while 1:
        pass

Executando:

::

    avelino:multithreading/ [11:01:01] $ python example.py
    Thread-1: Thu Mar 31 11:03:20 2011
    Thread-2: Thu Mar 31 11:03:22 2011
    Thread-1: Thu Mar 31 11:03:22 2011
    Thread-1: Thu Mar 31 11:03:24 2011
    Thread-2: Thu Mar 31 11:03:26 2011
    Thread-1: Thu Mar 31 11:03:26 2011
    Thread-1: Thu Mar 31 11:03:28 2011
    Thread-2: Thu Mar 31 11:03:30 2011
    Thread-2: Thu Mar 31 11:03:34 2011
    Thread-2: Thu Mar 31 11:03:38 2011

Se repararmos temos alguns processo concorrendo ao mesmo tempos, dessa
forma já estamos trabalhando com Thread.

Modulos da biblioteca thread
----------------------------

-  *threading.activeCount()*: Retorna o número de objetos de thread que
   estão ativos.
-  *threading.currentThread()*: Retorna o número de objetos de thread no
   controle do chamador de thread.
-  *threading.enumerate()*: Retorna uma lista de todos os objetos de
   thread que estão atualmente activas.
-  *run()*: Método é o ponto de partida para uma thread.
-  *start()*: Método inicia uma thread, chamando o método de execução.
-  *join([time])*: Espera para terminar.
-  *isAlive()*: Método verifica se uma thread ainda está em execução.
-  *getName()*: Método retorno o nome de uma thread.
-  *setName()*: Método declaro o nome de um thread.

