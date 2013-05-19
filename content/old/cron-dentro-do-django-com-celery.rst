Cron dentro do Django com Celery
################################
:date: 2010-10-19 22:34
:author: avelino
:category: Django
:slug: cron-dentro-do-django-com-celery

| Ontem na parte da noite conversando com um conhecido ele falou que
estava usando em um projeto o `Celery`_, como ainda não conhecia vamos
estudar este projeto. Gostei da forma que ele trabalha e como ele
integra com o `Django`_.
|  Tenho em um projeto uma fila de processamento só que foi desenvolvido
por mim e não tem todos os recursos que o `Celery`_ tem.

Vou explicar como usar o `Celery`_ com o `Django`_ em um exemplo
simples, e como sempre basta usar a criatividade para desenvolver a sua
necessidade.

Primeiramente temos que instalar dois pacotes Python para que possamos
trabalhar com o Celery no Django, o django-celery e ghettoq. Caso
tenhamos o easy\_install instalado basta instalar os pacotes da seguinte
forma:

::

    $ easy_install django-celery
    $ easy_install ghettoq

Caso não tenha vamos instalar:

::

    $ cd /usr/src/
    $ git clone http://github.com/ask/django-celery.git
    $ cd django-celery
    $ python setup.py build
    $ python setup.py install
    $ cd ..
    $ git clone http://github.com/ask/ghettoq
    $ cd ghettoq
    $ python setup.py build
    $ python setup.py install

Após instalar vamos criar um projeto para que possamos trabalhar com o
Celery nele.

::

    $ django-admin.py startproject celerytest
    $ cd celerytest

Vamos editar o settings.py:

::

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'test',
        }
    }
    ...
    CARROT_BACKEND = "ghettoq.taproot.Database"
    INSTALLED_APPS = (
        ...
        'djcelery',
        'ghettoq',
    )

Após declarar qual biblioteca o projeto em Django vai carregar podemos
sincronizar o nosso database:

::

    $ python manage.py syncdb

Temos que criar um arquivo chamado tasks.py, esse arquivo trabalha como
o models de uma aplicação:

::

    from celery.task.schedules import crontab
    from celery.decorators import periodic_task

    # this will run every minute, see http://celeryproject.org/docs/reference/celery.task.schedules.html#celery.task.schedules.crontab
    @periodic_task(run_every=crontab(hour="*", minute="*", day_of_week="*"))
    def test():    
        print "Tarefa de teste..."

Agora temos que dar start em nosso daemon Celery:

::

    $ python manage.py celeryd -v 2 -B -s celery -E -l INFO
    2010-10-19 05:34:44,215: WARNING/MainProcess] celery@program-8 v2.1.1 is starting.
    [2010-10-19 05:34:44,216: WARNING/MainProcess] /usr/local/lib/python2.6/dist-packages/celery-2.1.1-py2.6.egg/celery/apps/
        worker.py:105: UserWarning: Running celeryd with superuser privileges is not encouraged!
      "Running celeryd with superuser privileges is not encouraged!")
    [2010-10-19 05:34:44,216: WARNING/MainProcess] /usr/local/lib/python2.6/dist-packages/celery-2.1.1-py2.6.egg/celery/apps/
        worker.py:108: UserWarning: Using settings.DEBUG leads to a memory leak, never use this setting in a production environment!
      warnings.warn("Using settings.DEBUG leads to a memory leak, "
    [2010-10-19 05:34:44,222: WARNING/MainProcess]  
    Configuration -&gt;
        . broker -&gt; ghettoq.taproot.Database://guest@localhost/
        . queues -&gt;
            . celery -&gt; exchange:celery (direct) binding:celery
        . concurrency -&gt; 2
        . loader -&gt; djcelery.loaders.DjangoLoader
        . logfile -&gt; [stderr]@INFO
        . events -&gt; ON
        . beat -&gt; ON
        . tasks -&gt;
     . celerytest.lol.tasks.test
    [2010-10-19 05:34:44,238: INFO/PoolWorker-2] child process calling self.run()
    [2010-10-19 05:34:44,239: INFO/PoolWorker-3] child process calling self.run()
    [2010-10-19 05:34:44,241: WARNING/MainProcess] celery@program-8 has started.
    [2010-10-19 05:34:44,241: INFO/Beat] child process calling self.run()
    [2010-10-19 05:34:44,241: INFO/Beat] Celerybeat: Starting...
    [2010-10-19 05:35:00,537: INFO/MainProcess] Got task from broker: celerytest.lol.tasks.test[22d15af7-8fe9-4acd-bdde-06265004eb50]
    [2010-10-19 05:35:00,760: WARNING/PoolWorker-3] firing test task
    [2010-10-19 05:35:01,088: INFO/MainProcess] Task celerytest.lol.tasks.test[22d15af7-8fe9-4acd-bdde-06265004eb50] processed: None

Pronto ele esta rodando.

O `Celery`_ é um projeto muito bom só que ainda estamos enfrentando
alguns bugs com processos pesado o pior que ele para de processar e não
esta dando nem um retorno, por isso antes colocar em produção teste sua
aplicação onde o `Celery`_ vai rodar.

.. _Celery: http://celeryproject.org/
.. _Django: http://www.djangoproject.com/
