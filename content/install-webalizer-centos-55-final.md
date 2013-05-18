Title: Install WebAlizer in CentOS 5.5 (Final)
Date: 2010-06-28 22:02
Author: avelino
Category: Avelino
Slug: install-webalizer-centos-55-final

<div class="separator" style="clear: both; text-align: center;">
[![][]][]

</div>
I needed to statisitca mirror for PHP ([br3.php.net][])

Install dependency:

~~~~ {.brush:python}
root@avelino: ~ # yum -y install gcc gcc-c++ gd gd-devel zlib zlib-devel
~~~~

Install webalizer:

~~~~ {.brush:python}
root@avelino: ~ # wget ftp://ftp.mrunix.net/pub/webalizer/webalizer-2.21-02-src.tgz
root@avelino: ~ # tar -xzvf webalizer-2.21-02-src.tgz
root@avelino: ~ # mv webalizer-2.21-02-src webalizer
root@avelino: ~ # mv webalizer /var/www/html
root@avelino: ~ # cd /var/www/html/webalizer
~~~~

Compile webalizer:

~~~~ {.brush:python}
root@avelino: ~ # ./configure
root@avelino: ~ # make
root@avelino: ~ # make install
root@avelino: ~ # mkdir /etc/webalizer
root@avelino: ~ # cp /usr/local/etc/webalizer.conf.sample /etc/webalizer
root@avelino: ~ # cd /etc/webalizer
root@avelino: ~ # mv webalizer.conf.sample webalizer.conf
root@avelino: ~ # vi webalizer.conf
~~~~

Config line:  
LogFile /var/log/httpd/access\_log  
OutputDir /var/www/html/webalizer  
HostName yourdomain.com

Run virtual proses

~~~~ {.brush:python}
root@avelino: ~ # for i in /etc/webalizer/*.conf; do webalizer -c $i ; done
~~~~

Check this out  
http://yourdomain.com/webalizer

<div class="separator" style="clear: both; text-align: center;">
[![][1]][]

</div>

  []: http://4.bp.blogspot.com/_ovJ6PyiUjqA/TCqCgH5mCjI/AAAAAAAAB6Q/ckojM-O4mPE/s1600/selobranco.jpg
  [br3.php.net]: http://br3.php.net/
  [1]: http://3.bp.blogspot.com/_ovJ6PyiUjqA/TCjKCxI4pDI/AAAAAAAAB5I/wwb74lX8s3A/s400/stats_br3_php.png
  [![][1]]: http://3.bp.blogspot.com/_ovJ6PyiUjqA/TCjKCxI4pDI/AAAAAAAAB5I/wwb74lX8s3A/s1600/stats_br3_php.png
