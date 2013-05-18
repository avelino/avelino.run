Title: Proxy transparente com Nginx
Date: 2012-08-09 13:05
Author: avelino
Category: Avelino, Experiência, Infra, Nginx
Tags: nginx, proxy, router, transparente
Slug: proxy-transparente-com-nginx

Muitas pessoas usam Squid para fazer qual quer tipo de proxy, ate mesmo
para proxy transparente para usar em servidor web, por exemplo:

Você tem um site que precisa ter IP aqui no Brasil so que como o custo
de servidor e link aqui no Brasil é muito caro, você pode fazer um proxy
transparente para o servidor aqui no Brasil ser um cara que vai receber
a requisição e repassar para o outro servidor que esteja em qual quer
lugar do mundo. Com essa solução podemos ter uma maquina simples
(maquina com pouco poder de processamento) pois ela só vai receber o
trafego e repassar para o servidor que esteja em outro local.

Vamos imaginar um exemplo pratico, preciso que o usuário acesse o IP
177.71.248.185 (é um servidor da Amazon no Brasil), esse servidor
precisa receber a requisição e repassar para o IP 67.159.35.2 (é maquina
principal onde é processado o backend, esse servidor esta fora
do Brasi). Foi usado essa solução em um portal que atendo para ter baixa
latencia.

Vamos ao exemplo pratico:

[gist id=3304942]

Criei um "upstream server" para falar qual é o servidor de destino do
trafego, na configuração acima tem um cache de 30 minutos pois no
servidor principal tem cache de 4 horas.

Logicamente que existe desvantagem com isso, pois vamos estar trafegando
em duas (ou mais) redes, assim usando o trafego do servidor que esta
recebendo a primeira requisição e do segunda que esta recebendo um
requisição do primeiro.
