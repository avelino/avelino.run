Title: Riak, alta performance NoSQL para seu projeto
Date: 2012-12-23 10:00
Author: avelino
Category: Avelino, MongoDB, NoSQL, Python, Riak
Tags: benchmark, mongodb, nosql, performance, python, riak
Slug: riak-alta-performance-nosql-para-seu-projeto

[![Riak Banco de dados NoSQL, focado em escalabilidade, disponibilidade
e performance][]][]Esse ano de 2012 ajudei a comunidade [Riak][] que a
cada dia esse banco de dados vem me surpreendendo. Estou para escrever
um blogpost desde fevereiro, mas como vida de programador (pelo menos
para mim esse ano) é agitada.

Resolvi falar sobre a performance nesse primeiro blogpost sobre Riak e
colocar na mesa um teste (relativamente simples) para compara o tempo de
inserção, realmente é um teste simples se tratando de NoSQL.

Antes de mostrar a comparação acho importante deixar claro as vantagens
que temos em utilizar Riak:

-   Disponibilidade: sistema de recuperação de dados onde trabalha de
    forma inteligente para que esteja disponível para ler e escrever
    operações, mesmo em ambiente com falha, assim garantindo a
    integridade dos dados;
-   Tolerância a falhas: pode perder o acesso aos nós (Servidores Riak),
    devido à falha de rede ou partição de hardware e nunca perder de
    dados;
-   Simplicidade de utilização: facil adição de máquinas em um cluster
    Riak, sem ocorrer uma carga nos servidores - isso em um pequeno
    grupo de servidores como uma grande quantidade de servidores Riak;
-   Escalabilidade: Riak distribui automaticamente os dados ao redor do
    cluster e produz um aumento de desempenho quase linear quando você
    adicionar dados.

Depois de deixar claro os itens acima podemos colocar na messa o Riak e
o grande [MongoDB][], lembrando que esse blogpost não é para falar qual
NoSQL é melhor ou para você parar de utilizar um ou outro banco, Riak e
MongoDB tem algumas características semelhantes, esse foi o motivo de
colocar em teste os dois.

O teste foi simples preciso inserir 1 milhão (1000000) de registro no
meu banco de dados, qual banco de dados entrega isso mais rápido para
mim?

Código Python usando drive nativo do Riak:

[gist id=4363258]

Código Python usando drive nativo do MongoDB:

[gist id=4363275]

Um código simples onde faço um loop que vai de 0 a 1000000 (estou
fazendo 1000001 inserção), e dentro de cada interação do loop estou
gerando um registro no banco de dados. Veja abaixo o resultado:

[gist id=4363325]

Realmente o tempo de execução do Riak é muito mas muito rápido, o que me
deixou mais surpreso foi o tempo do MongoDB, o MongoDB demorou 9 vezes
mais comparado com o Riak.

Não estou falando que o MongoDB é ruim, ate mesmo que tenho projetos
grande em produção usando ele e dependendo do projeto/infra recomendo
usar MongoDB.

  [Riak Banco de dados NoSQL, focado em escalabilidade, disponibilidade
  e performance]: http://avelino.us/wp-content/uploads/2012/12/riak-transparent-larger-300x94.png
    "riak-nosql"
  [![Riak Banco de dados NoSQL, focado em escalabilidade,
  disponibilidade e performance][]]: http://avelino.us/wp-content/uploads/2012/12/riak-transparent-larger.png
  [Riak]: http://basho.com/products/riak-overview/ "Riak overview"
  [MongoDB]: http://www.mongodb.org/ "MongoDB"
