Mexer no que esta quieto (Servidor Linux)
#########################################
:date: 2010-06-29 22:03
:author: avelino
:category: Fail
:slug: mexer-no-que-esta-quieto-servidor-linux

| Bom resolvi fazer atualização no servidor onde roda os mirror (CentOS
e PHP)
| 
|  E com sempre.... PAM (Grande surpresa)

| Ele atualizou o servidor de DNS (PowerDNS) e lá vem a merda....
| 
|  Pensei que ele tinha trocado o file de conf e dei um mv em outro que
estava na pasta, que beleza faz as coisas sem olhar, o file
estava correto e coloquei um errado o servidor DNS não respondia...

| Pessoal cuidado com servidores em produção.

+--------------------------------------------------+
| |image1|                                         |
+--------------------------------------------------+
| Servidor de MIRROR esta na Locaweb, recomendo.   |
+--------------------------------------------------+

.. |image0| image:: http://4.bp.blogspot.com/_ovJ6PyiUjqA/TCqCgH5mCjI/AAAAAAAAB6Q/ckojM-O4mPE/s1600/selobranco.jpg
   :target: http://4.bp.blogspot.com/_ovJ6PyiUjqA/TCqCgH5mCjI/AAAAAAAAB6Q/ckojM-O4mPE/s1600/selobranco.jpg
.. |image1| image:: http://4.bp.blogspot.com/_ovJ6PyiUjqA/TCqCgH5mCjI/AAAAAAAAB6Q/ckojM-O4mPE/s1600/selobranco.jpg
   :target: http://4.bp.blogspot.com/_ovJ6PyiUjqA/TCqCgH5mCjI/AAAAAAAAB6Q/ckojM-O4mPE/s1600/selobranco.jpg
