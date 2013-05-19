pyBotIRC Bot em Python para IRC
###############################
:date: 2010-05-23 21:56
:author: avelino
:category: Python
:slug: pybotirc-bot-em-python-para-irc

Bot simples usando socket no Python:

::

    import sys
    import socket
    import string

    HOST="irc.freenode.net"
    PORT=6667
    NICK="pyAvelino"
    IDENT="pyAvelino"
    REALNAME="pyBotIRC"
    readbuffer=""
    CHANNELINIT="#channel"

    s=socket.socket( )
    s.connect((HOST, PORT))
    s.send("NICK %s\r\n" % NICK)
    s.send("USER %s %s bla :%s\r\n" % (IDENT, HOST, REALNAME))
    s.send('JOIN %s\r\n' % CHANNELINIT)

    while 1:
    # readbuffer=readbuffer+s.recv(1024)
    readbuffer=s.recv(1024)
    print readbuffer
    temp=string.split(readbuffer, "\n")
    readbuffer=temp.pop( )

    for line in temp:
        line=string.rstrip(line)
        line=string.split(line)

        if(line[0]=="PING"):
            s.send("PONG %s\r\n" % line[1])

