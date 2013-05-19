Algumas diferença entre YUM e APT
#################################
:date: 2010-06-21 22:00
:author: avelino
:category: Avelino
:slug: algumas-diferenca-entre-yum-e-apt

Na tabela abaixo tem algumas diferença entre o YUM e APT.

.. raw:: html

   <table border="0" cellpadding="2">

.. raw:: html

   <tbody>

.. raw:: html

   <tr>

.. raw:: html

   <th class="cmd">

APT

.. raw:: html

   </th>

.. raw:: html

   <th class="cmd">

YUM

.. raw:: html

   </th>

.. raw:: html

   <th class="cmt">

Descrição breve

.. raw:: html

   </th>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get install *"pacote"*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum install *"pacote"*
|  yum groupinstall *"grupo\_pacote"*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Instala um pacote ou um grupo de pacotes (para ver os grupos de pacotes
que podem ser instalados digite **"yum grouplist"**. Por exemplo, para
instalar o X11 é necessario digitar o comando "**yum groupinstall "X
Window System"**\ ". Já para instalar o KDE digite "**yum groupinstall
"KDE (K Desktop Environment)"**\ ").

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get install *"pacote"*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum update *"pacote"*
|  yum upgrade *"pacote"*
|  yum install *"pacote"*
|  yum groupinstall *"grupo\_pacote"*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Atualiza um pacote ou um grupo de pacotes já instalados. Para ver os
grupos de pacotes que podem ser instalados digite **"yum grouplist"**.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get install -d *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum install --downloadonly
|  yumdownloader *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Faz o download do pacote, lembrando que com o apt-get e com o yum o
download é feito para o diretório do cache (/var/cache/). Já com o
"yumdownloader", o **rpm** vai por padrão para o diretório atual. Para
utilizar a opção "--downloadonly" do comando "yum" é necessário instalar
um plugin (yum install yum-plugin-downloadonly)

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get install -V *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Instala um pacote, mostrando as suas versões.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get install --auto-remove *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Remove as dependências sem uso ao instalar um pacote.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get install --reinstall *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum reinstall *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Reinstala o pacote já instalado.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get install -m \| --fix-missing \| --ignore-missing *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

x

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

**CORRIGIR PROBLEMAS:** ignora pacotes perdidos. Pode-se usá-lo em
conjunto com a opção **"-f"**. Use este comando quando aparecer erros
como "500 Can't connect to ftp.debian.org (Connect: Network is
unreachable) Faile to fetch http://IP:porta.... Este erro pode aparecer
ao tentar instalar um pacote depois de ter sido executado com sucesso o
"apt-get update".

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get install -f \| --fix-broken *[pacote]*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

x

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

**CORRIGIR PROBLEMAS:** tenta corrigir o sistema com dependências
quebradas.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get remove *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Este comando não removem as dependências sem uso (orfãs) do pacote que
será removido e nem remove os arquivos de configuração. Contudo avisa
quais são essas dependências e mostra como removê-las (apt-get
autoremove).

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get remove --purge *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum remove *pacote*
|  yum erase *pacote*
|  yum groupremove *"grupo\_pacote"*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Estes comando não removem as dependências sem uso (orfãs) do pacote que
será removido, mas remove os arquivos de configuração.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get remove --purge --auto-remove *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum remove --remove-leaves *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Remove as dependências sem uso ao remover um pacote. Por padrão o yum e
o apt não removem as dependências sem uso. Veja também o comando
"deborphan" e "rpmorphan". Para usar a opção "--remove-leaves" do
comando "yum" é necessário instalar um plugin (yum install
yum-plugin-remove-with-leaves).

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get remove -f \| --fix-broken *[pacote]*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

x

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

**CORRIGIR PROBLEMAS:** tenta corrigir o sistema com dependências
quebradas.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get update

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum makecache

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Atualiza a lista de todos os pacotes disponíveis (a lista dos pacotes
disponíveis fica numa database feita a partir do comando "apt-get
update" ou "yum makecache". Ao utilizar o comando "yum makecache" tudo
que está dentro de "/etc/yum.repos.d/" é verificado).

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get upgrade

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum update
|  yum groupupdate

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Atualiza os pacotes já instalados.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get dist-upgrade

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum upgrade
|  yum update --obsoletes

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Atualiza a versão da distribuição. O "yum upgrade" = "yum update
--obsoletes". Veja o plugin para o "yum" chamado
"yum-plugin-upgrade-helper".

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get autoremove

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Remove as dependências sem uso.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-cache search *expressão*

.. raw:: html

   </p>

.. raw:: html

   <p>

apt-cache pkgnames *expressão*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum search *expressão*
|  yum provides *pacote*
|  yum whatprovides *pacote*
|  yum list *pacote*
|  yum grouplist *grupo\_pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Procura a expressão em todos os pacotes disponíveis, nas suas descrições
breves e/ou nas descrições detalhadas. A lista dos pacotes disponíveis
fica numa database feita a partir do comando "apt-get update" ou "yum
makecache". As opções "provides" e "whatprovides" do comando "yum"
mostram a descrição breve do pacote.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-cache show *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum info *[pacote]*
|  yum groupinfo *grupo\_pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Mostra informações sobre um pacote ou no caso do "yum info" pode mostrar
informações de todos os pacotes.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-cache pkgnames *[expressão]*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| yum list *[nome\_pacote]*
|  yum grouplist [nome\_grupo\_pacote]

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Mostra uma lista de pacotes disponíveis (a lista dos pacotes disponíveis
fica numa database feita a partir do comando "apt-get update" ou "yum
makecache") ou um que coincida com a expressão utilizada.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-cache depends *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum deplist *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Mostra as dependências de um determinado pacote. Também mostra
sugestões, conflitos e recomendações.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-cache stats

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Mostra estatísticas sobre a database do pacotes.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-cache policy

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Mostra como está a configuração do "/etc/apt/preferences" que prioriza
pacotes.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get clean

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum clean packages

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Apaga o cache local gerado ao instalar ou atualizar algum pacote. Eles
ficam em "/var/cache/apt/" ou em "/var/cache/yum/"

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum clean dbcache

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

---

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum clean headers

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

---

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum clean metadata

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

apaga arquivos XML, XML.TGZ e SQLITE que ficam dentro de
"/var/cache/yum/fedora" e em "/var/cache/yum/updates". Este comando
apaga cache da lista de pacotes disponíveis que são gerados ao utilizar
comando como "yum update", "yum makecache" etc. Então, ao utilizar o
comando "yum clean metadata" toda lista de pacotes terá que ser baixada
novamente.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum clean all

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Equivalente aos comando "yum clean headers", "yum clean metadata", "yum
clean packages" e "yum clean dbcache"

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get source *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Faz o download do código fonte do pacote para o diretório atual,
incluindo o diretório descompactado do pacote (já faz a descompactação
do tar.gz) e aparecem vários outros pacotes relacionados.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-get source -d *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yumdownloader --source *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Faz o download do código fonte do pacote para o diretório atual. No caso
do "apt-get" é um "tar.gz". Já com o "yumdownloader" é um "src.rpm".

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum-builddep *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

x

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

| /etc/apt/sources.list
|  apt-get update
|  apt-get install
|  apt-get upgrade
|  etc

.. raw:: html

   </p>

.. raw:: html

   <p>

.. raw:: html

   <center>

ou

.. raw:: html

   </center>

| /etc/apt/preferences
|  apt-get install -t etch *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum downgrade *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

O manual on-line "man apt-get" recomenda cuidado ao fazer downgrades. No
caso do comando "apt" se deve primeiro mudar o repositório
(/etc/apt/sources.list) e depois atualizar a lista de pacotes
disponíveis (apt-get update) antes de tentar um downgrade.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

yum {ação} --noplugins *pacote*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Roda com todos os plugins desabilitado. Os plugins são habilitados por
padrão.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-file search /caminho/arquivo

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

rpm -qf / caminho/arquivo

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Descobre em qual pacote está um determinado arquivo ou biblioteca.
Deve-se passar o path do arquivo em vez e digitar "apt-file update" para
atualizar o cache. Este comando é o mesmo que consultar o endereço
`packages.debian.org`_

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

apt-key update

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Caso real que aparecia a mensagem "W: GPG error:". Digitei "apt-key
update" e resolveu o problema.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

| apt-get install debian-archive-keyring
|  apt-get update

.. raw:: html

   </p>

.. raw:: html

   <p>

.. raw:: html

   <center>

ou

.. raw:: html

   </center>

| 
|  apt-get install --reinstall debian-archive-keyring
|  apt-get update

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Caso real que apareciam as seguintes mensagens ao utilizar o comando
"apt": **"W: GPG error:", "The following packages could not be
authenticated debian", "The following signatures couldn't be verified
because the public key is not available", "There is no public key
available for the following key IDs" ou "The following signatures were
invalid".**.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

| 
| 

.. raw:: html

   <center>

**Arquivos de
 Configuração**

.. raw:: html

   </center>

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| 
| 

.. raw:: html

   <center>

**Arquivos de
 Configuração**

.. raw:: html

   </center>

.. raw:: html

   </td>

.. raw:: html

   <th class="cmt">

Descrição breve

.. raw:: html

   </th>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

/etc/apt/sources.list

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

| /etc/yum.repos.d/fedora.repo
|  /etc/yum.repos.d/fedora-updates.repo
|  /etc/yum.repos.d/fedora-updates-testing.repo
|  /etc/yum.repos.d/fedora-rawhide.repo

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

\* fedora.repo: repositório padrão de pacotes do Fedora;

.. raw:: html

   </p>

\* fedora-updates.repo: repositório de atualizações de pacotes já
testadas;

\* fedora-updates-testing.repo: repositório de atualizações de pacotes
que estão em fase de teste;

.. raw:: html

   <p>

\* fedora-rawhide.repo: repositório de pacotes não testados e que ainda
em desenvolvimento. Este repositório é mais usado por desenvolvedores
para testarem novos pacotes para a próxima versão do Fedora.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

/etc/apt/apt.conf

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

/etc/yum.conf

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Arquivo de configuração das ações que devem ser tomandas ao utiliza o
comando apt.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

/var/cache/apt/

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

/var/cache/yum/

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Cache dos pacotes e das databases.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

/etc/apt/preferences

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Prioridades das versões do Debian GNU/Linux.

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

/var/lib/dpkg/status

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

/var/lib/rpm/\*

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Lista de pacotes instalados ou não-instalados

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

/etc/yum/pluginconf.d/

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Diretório onde ficam arquivos de configuração dos plugins (novas
funcionalidades) para o comando "yum".

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   <tr>

.. raw:: html

   <td class="cmd">

---

.. raw:: html

   </td>

.. raw:: html

   <td class="cmd">

/etc/yum/yum-updatesd.conf

.. raw:: html

   </td>

.. raw:: html

   <td class="cmt">

Arquivo de configuração para o daemon do "yum" que notifica a existência
de atualização. Esta notificação pode ser através de e-mail, syslog ou
sobre o dbus (daemon de menssagem).

.. raw:: html

   </td>

.. raw:: html

   </tr>

.. raw:: html

   </tbody>

.. raw:: html

   </table>

by \ `Hugo`_

.. _packages.debian.org: http://draft.blogger.com/packages.debian.org/
.. _Hugo: http://www.hugoazevedo.eti.br/html/apt_yum.html
