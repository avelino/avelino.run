Proxy transparente com Nginx
############################
:date: 2012-08-09 13:05
:author: avelino
:category: Nginx
:tags: nginx, proxy, router, transparente
:slug: proxy-transparente-com-nginx

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

.. code-block:: nginx

    upstream server {
        server 67.159.35.2;
    }
    server {
        listen       80;
        server_name  avelino.us www.avelino.us;
        location / {

            proxy_cache proxy-cache;
            proxy_cache_key "$host$request_uri$args";
            proxy_ignore_headers "Cache-Control" "Expires";
            proxy_cache_min_uses 1;
            proxy_hide_header Set-Cookie;
            proxy_cache_valid 200 301 302 30m;
            proxy_cache_valid any 0m;
            proxy_buffering on;

            proxy_pass http://server;
            proxy_redirect off;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

    }


Criei um "upstream server" para falar qual é o servidor de destino do
trafego, na configuração acima tem um cache de 30 minutos pois no
servidor principal tem cache de 4 horas.

Logicamente que existe desvantagem com isso, pois vamos estar trafegando
em duas (ou mais) redes, assim usando o trafego do servidor que esta
recebendo a primeira requisição e do segunda que esta recebendo um
requisição do primeiro.
