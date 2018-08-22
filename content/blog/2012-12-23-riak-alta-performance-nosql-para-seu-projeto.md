+++
date = "2012-12-23"
title = "Riak, alta performance NoSQL para seu projeto"
tags = ["riak", "nosql", "python"]
aliases = ["/2012/12/riak-alta-performance-nosql-para-seu-projeto"]
+++

Esse ano de 2012 ajudei a comunidade [Riak](http://basho.com/products/riak-overview/) que a cada dia esse banco de dados vem me surpreendendo. Estou para escrever um blogpost desde fevereiro, mas como vida de programador (pelo menos para mim esse ano) é agitada.

Resolvi falar sobre a performance nesse primeiro blogpost sobre Riak e colocar na mesa um teste (relativamente simples) para compara o tempo de inserção, realmente é um teste simples se tratando de NoSQL.

Antes de mostrar a comparação acho importante deixar claro as vantagens que temos em utilizar Riak:

- Disponibilidade: sistema de recuperação de dados onde trabalha de forma inteligente para que esteja disponível para ler e escrever operações, mesmo em ambiente com falha, assim garantindo a integridade dos dados;
- Tolerância a falhas: pode perder o acesso aos nós (Servidores Riak), devido à falha de rede ou partição de hardware e nunca perder de dados;
- Simplicidade de utilização: facil adição de máquinas em um cluster Riak, sem ocorrer uma carga nos servidores - isso em um pequeno grupo de servidores como uma grande quantidade de servidores Riak;
- Escalabilidade: Riak distribui automaticamente os dados ao redor do cluster e produz um aumento de desempenho quase linear quando você adicionar dados.

Depois de deixar claro os itens acima podemos colocar na messa o Riak e o grande MongoDB, lembrando que esse blogpost não é para falar qual NoSQL é melhor ou para você parar de utilizar um ou outro banco, Riak e MongoDB tem algumas características semelhantes, esse foi o motivo de colocar em teste os dois.

O teste foi simples preciso inserir 1 milhão (1000000) de registro no meu banco de dados, qual banco de dados entrega isso mais rápido para mim?

Código Python usando drive nativo do Riak:

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import riak



client = riak.RiakClient()
bucket = client.bucket('test')

for i in range(0, 1000000):
    person = bucket.new('riak_developer_%d' % i, data={'name': 'Thiago Avelino %d' % i,
                                                       'age': 18+i,
                                                       'language': ['python'],})
```

Código Python usando drive nativo do MongoDB:

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pymongo import MongoClient



connection = MongoClient()
db = connection.test
persons = db.persons

for i in range(0, 1000000):
    person = persons.insert({'name': 'Thiago Avelino %d' % i,
                             'age': 18+i,
                             'language': ['python'],})
```

Um código simples onde faço um loop que vai de 0 a 1000000 (estou fazendo 1000001 inserção), e dentro de cada interação do loop estou gerando um registro no banco de dados. Veja abaixo o resultado:

```shell
(riak-test) ~/Sites/riak-test$ time python riak.py
python riak.py  15.60s user 0.14s system 99% cpu 15.850 total

(riak-test) ~/Sites/riak-test$ time python mongodb.py
python mongodb.py  144.14s user 35.47s system 55% cpu 5:25.85 total
```

Realmente o tempo de execução do Riak é muito mas muito rápido, o que me deixou mais surpreso foi o tempo do MongoDB, o MongoDB demorou 9 vezes mais comparado com o Riak.

Não estou falando que o MongoDB é ruim, ate mesmo que tenho projetos grande em produção usando ele e dependendo do projeto/infra recomendo usar MongoDB.
