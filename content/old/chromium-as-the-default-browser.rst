Chromium as the default browser
###############################
:date: 2013-03-02 01:18
:author: avelino
:category: Javascript
:tags: browser, chrome, chromium, mac, update, upgrade
:slug: chromium-as-the-default-browser

|Logo Chromium|\ The code of Google Chrome is based on Chromium, all the
feature implemented in Chromium comes in Google Chrome.

What do you think of being one of the first to test new feature of
Google Chrome? Interesting huh!

`Download a bleeding-edge build of Chromium for Mac!`_

Chromium does not update automatically, for this reason I wrote a shell
script which updates the Chromium on Mac:

.. code-block:: sh

    #!/bin/sh
    #
    # Note, this will remove /Applications/Chromium.app
    #

    echo '..'
    rm -f chrome-mac.zip chrome-mac
    export CHROME_VERSION=`curl http://commondatastorage.googleapis.com/chromium-browser-continuous/Mac/LAST_CHANGE`
    echo "   latest version: $CHROME_VERSION"
    echo '..'
    export CHROME_OLD_VERSION=`cat ~/dotfile/CHROME_VERSION`
    if [ $CHROME_VERSION == $CHROME_OLD_VERSION ]; then
      echo '   latest version!'
      echo '..'
      exit 2
    fi
    echo $CHROME_VERSION > ~/doestfile/CHROME_VERSION
    echo "   save latest version: $CHROME_VERSION"
    echo '..'
    echo "   get latest version: $CHROME_VERSION"
    echo '..'
    wget http://commondatastorage.googleapis.com/chromium-browser-continuous/Mac/$CHROME_VERSION/chrome-mac.zip
    echo "   compile latest version: $CHROME_VERSION"
    echo '..'
    unzip chrome-mac.zip
    rm -rf /Applications/Chromium.app
    echo "   install latest version: $CHROME_VERSION"
    echo '..'
    mv chrome-mac/Chromium.app /Applications/Chromium.app
    rm -rf chrome-mac chrome-mac.zip
    killall -9 Chromium
    open /Applications/Chromium.app
    echo 'DONE'

base source: \ https://github.com/avelino/dotfile/blob/master/chromium_update.sh

.. _Download a bleeding-edge build of Chromium for Mac!: http://download-chromium.appspot.com/dl/Mac

.. |Logo Chromium| image:: /media/chromium-logo.png
   :target: /static/images/chromium-logo.png
