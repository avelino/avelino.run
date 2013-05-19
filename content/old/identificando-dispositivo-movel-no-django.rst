Identificando dispositivo movel no Django
#########################################
:date: 2010-10-16 22:32
:author: avelino
:category: Django
:slug: identificando-dispositivo-movel-no-django

Hoje temos uma biblioteca chamada de `Bloom Device`_ feira para Django
desenvolvida por `bishanty`_ e `kevin.tom`_.

| **Como instalar?**

.. code:: brush:python

    $ wget http://django-bloom.googlecode.com/files/bloom-0.1.tar.gz
    $ tar -tzvf bloom-0.1.tar.gz
    $ cd django-bloom
    $ python setup.py install

Antes de instalar esta biblioteca teríamos que fazer da segunte forma:

.. code:: brush:python

    >>> request.META['HTTP_USER_AGENT']
    'SonyEricssonW850i/R1GB Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1'

E pegar o resultado do HTTP\_USER\_AGENT e parcia. Com o Bloom Device
ele retorna um JSON:

.. code:: brush:python

    >>> request.device
    {u'mobileDevice': '1', u'displayWidth': '240', u'displayHeight': '320', u'vendor': 'Sony Ericsson',  u'model': 'W850i', ...}

| **Como usar no Django?**
| 
|  Depois de instalado temos que instanciar o Bloom Device no Django no
settings.py:

.. code:: brush:python

    INSTALLED_APPS = (
    ...
    'bloom.device',
    ...
    )
    ...
    MIDDLEWARE_CLASSES = (
    ...
    'bloom.device.middleware.DeviceDetectMiddleware',
    ...
    )

Na views da aplicação vamos usar assim:

.. code:: brush:python

    @detect_device
    from bloom.device.decorators import detect_device
    def my_view(request):
    print request.device
    ...

| 
|  Agora vai a criatividade para poder trabalhar com o Bloom Device.

| **Recomendações**

-  `jQuery Mobile`_

.. _Bloom Device: http://code.google.com/p/django-bloom/
.. _bishanty: http://code.google.com/u/bishanty/
.. _kevin.tom: http://code.google.com/u/kevin.tom/
.. _jQuery Mobile: http://jquerymobile.com/
