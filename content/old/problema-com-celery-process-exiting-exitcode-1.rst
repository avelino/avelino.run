Problema com Celery "process exiting with exitcode 1"
#####################################################
:date: 2010-12-16 22:34
:author: avelino
:category: Django
:slug: problema-com-celery-process-exiting-exitcode-1

Hoje estava rodando o Celery em um projeto e me deparei com um problema,
o "process exiting with exitcode 1" quando dava start no Celery:

::

    [root@xen-01 gonow]# python2.7 manage.py celeryd -v 2 -B -s celery -E -l INFO
    [2010-12-16 09:18:13,184: WARNING/MainProcess] celery@xen-01 v2.1.3 is starting.
    [2010-12-16 09:18:13,185: WARNING/MainProcess] /usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/apps/ 
            worker.py:107: UserWarning: Running celeryd with superuser privileges is not encouraged!
      "Running celeryd with superuser privileges is not encouraged!")
    [2010-12-16 09:18:13,185: WARNING/MainProcess] /usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/apps/
            worker.py:110: UserWarning: Using settings.DEBUG leads to a memory leak, never use this setting in a production environment!
      warnings.warn("Using settings.DEBUG leads to a memory leak, "
    [2010-12-16 09:18:13,188: WARNING/MainProcess] 
    Configuration ->
        . broker -> ghettoq.taproot.Database://guest@localhost/
        . queues ->
            . celery -> exchange:celery (direct) binding:celery
        . concurrency -> 2
        . loader -> djcelery.loaders.DjangoLoader
        . logfile -> [stderr]@INFO
        . events -> ON
        . beat -> ON
        . tasks ->
            . gonow.vps.tasks.lvm
    [2010-12-16 09:18:13,213: INFO/PoolWorker-2] child process calling self.run()
    [2010-12-16 09:18:13,223: INFO/PoolWorker-3] child process calling self.run()
    [2010-12-16 09:18:13,237: INFO/Beat] child process calling self.run()
    [2010-12-16 09:18:13,239: INFO/Beat] Celerybeat: Starting...
    [2010-12-16 09:18:13,239: WARNING/MainProcess] celery@xen-01 has started.
    [2010-12-16 09:18:13,257: INFO/Beat] process shutting down
    [2010-12-16 09:18:13,258: WARNING/Beat] Process Beat:
    [2010-12-16 09:18:13,259: WARNING/Beat] Traceback (most recent call last):
    [2010-12-16 09:18:13,259: WARNING/Beat] File "/usr/local/lib/python2.7/multiprocessing/process.py", line 232, in _bootstrap
    [2010-12-16 09:18:13,284: WARNING/Beat] self.run()
    [2010-12-16 09:18:13,285: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/beat.py",
            line 392, in run
    [2010-12-16 09:18:13,291: WARNING/Beat] self.service.start(embedded_process=True)
    [2010-12-16 09:18:13,292: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/beat.py",
            line 322, in start
    [2010-12-16 09:18:13,292: WARNING/Beat] humanize_seconds(self.scheduler.max_interval)))
    [2010-12-16 09:18:13,292: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/beat.py",
            line 362, in scheduler
    [2010-12-16 09:18:13,292: WARNING/Beat] self._scheduler = self.get_scheduler()
    [2010-12-16 09:18:13,292: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/beat.py",
            line 354, in get_scheduler
    [2010-12-16 09:18:13,293: WARNING/Beat] lazy=lazy)
    [2010-12-16 09:18:13,293: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/utils/
            __init__.py", line 362, in instantiate
    [2010-12-16 09:18:13,297: WARNING/Beat] return get_cls_by_name(name)(*args, **kwargs)
    [2010-12-16 09:18:13,298: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/beat.py",
            line 274, in __init__
    [2010-12-16 09:18:13,298: WARNING/Beat] Scheduler.__init__(self, *args, **kwargs)
    [2010-12-16 09:18:13,298: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/beat.py",
            line 150, in __init__
    [2010-12-16 09:18:13,299: WARNING/Beat] self.setup_schedule()
    [2010-12-16 09:18:13,299: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/beat.py",
            line 279, in setup_schedule
    [2010-12-16 09:18:13,299: WARNING/Beat] self.merge_inplace(conf.CELERYBEAT_SCHEDULE)
    [2010-12-16 09:18:13,299: WARNING/Beat] File "/usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/beat.py",
            line 250, in merge_inplace
    [2010-12-16 09:18:13,299: WARNING/Beat] if self.get(key):
    [2010-12-16 09:18:13,300: WARNING/Beat] File "/usr/local/lib/python2.7/UserDict.py", line 61, in get
    [2010-12-16 09:18:13,310: WARNING/Beat] return self[key]
    [2010-12-16 09:18:13,310: WARNING/Beat] File "/usr/local/lib/python2.7/UserDict.py", line 20, in __getitem__
    [2010-12-16 09:18:13,310: WARNING/Beat] return self.data[key]
    [2010-12-16 09:18:13,311: WARNING/Beat] File "/usr/local/lib/python2.7/shelve.py", line 122, in __getitem__
    [2010-12-16 09:18:13,317: WARNING/Beat] value = Unpickler(f).load()
    [2010-12-16 09:18:13,318: WARNING/Beat] EOFError
    [2010-12-16 09:18:13,318: INFO/Beat] process exiting with exitcode 1

O motivo desse error é que antes de dar start no Celery ele já esta
rodando em memoria. Quando rodamos o Celery ele cria alguns arquivos no
projeto para gerenciamento de Task, um dele é o celery.dir  que guarda
informações das function que vai ser processada de X em X tempo.

Bom a solução para esse casa é apagar o arquivo "celery.dir" assim ele
zera o task do Celery, quando der start novamente ele recria o
"celery.dir".

Agora ele só normal:

::

    [root@xen-01 gonow]# python2.7 manage.py celeryd -v 2 -B -s celery -E -l INFO
    [2010-12-16 09:18:28,539: WARNING/MainProcess] celery@xen-01 v2.1.3 is starting.
    [2010-12-16 09:18:28,540: WARNING/MainProcess] /usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/apps/
            worker.py:107: 
            UserWarning: Running celeryd with superuser privileges is not encouraged!
      "Running celeryd with superuser privileges is not encouraged!")
    [2010-12-16 09:18:28,540: WARNING/MainProcess] /usr/local/lib/python2.7/site-packages/celery-2.1.3-py2.7.egg/celery/apps/
            worker.py:110:
            UserWarning: Using settings.DEBUG leads to a memory leak, never use this setting in a production environment!
      warnings.warn("Using settings.DEBUG leads to a memory leak, "
    [2010-12-16 09:18:28,543: WARNING/MainProcess]  
    Configuration ->
        . broker -> ghettoq.taproot.Database://guest@localhost/
        . queues ->
            . celery -> exchange:celery (direct) binding:celery
        . concurrency -> 2
        . loader -> djcelery.loaders.DjangoLoader
        . logfile -> [stderr]@INFO
        . events -> ON
        . beat -> ON
        . tasks ->
            . gonow.vps.tasks.lvm
    [2010-12-16 09:18:28,568: INFO/PoolWorker-2] child process calling self.run()
    [2010-12-16 09:18:28,578: INFO/PoolWorker-3] child process calling self.run()
    [2010-12-16 09:18:28,591: INFO/Beat] child process calling self.run()
    [2010-12-16 09:18:28,593: INFO/Beat] Celerybeat: Starting...
    [2010-12-16 09:18:28,596: WARNING/MainProcess] celery@xen-01 has started.

