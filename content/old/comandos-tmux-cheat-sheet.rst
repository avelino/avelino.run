Comandos tmux (cheat sheet)
###########################
:date: 2012-10-08 17:49
:author: avelino
:category: shell
:tags: cheat, comandos, command, help, sheet, tmux
:slug: comandos-tmux-cheat-sheet

`tmux`_ é um software que pode ser usado para vários consoles de
multiplex virtuais, permitindo que um usuário acesse múltiplas sessões
de terminais separados dentro de uma janela de um único terminal ou
sessão de terminal remoto. É útil para lidar com vários programas a
partir de uma interface de linha de comando, e para separar os programas
a partir do shell do Unix, que começou o programa. Distribuído sob uma
licença BSD.

tmux - terminal multiplexer
===========================

Managing tmux sessions
----------------------

.. code-block:: bash

    tmux # start tmux server
    tmux at # attach running sessions to a terminal
    tmux ls # list running tmux sessions

Sharing sessions between terminals
----------------------------------

.. code-block:: bash

    tmux new -s session_name # make new named session
    tmux at -t session_name # attach to exist session (allowing shared sessions)

Commands (used within a running tmux session)
---------------------------------------------

.. code-block:: bash

    c  - create new window
    n/l - next/last window
    &  - kill current window

    %  - split window, adding a vertical pane to the right
    "  - split window, adding an horizontal pane below
    ←/→ - move focus to left/right pane
    ↑/↓ - move focus to upper/lower pane

    !  - Break current pane into new window
    x  - Kill the current pane.
    d  - detach the current client

    [  - enter copy mode (then use emacs select/yank keys)
        * press CTRL-SPACE or CTRL-@ to start selecting text
        * move cursor to end of desired text
        * press ALT-w to copy selected text

    ]  - paste copied text

    ?  - show tmux key bindings


.. note::

    * All commands need to be prefixed with the action key.
    * By default, this is CTRL-b


|image0|

.. _tmux: http://tmux.sourceforge.net/

.. |image0| image:: http://avelino.us/wp-content/uploads/2012/10/Screenshot-at-2012-10-08-174927-300x187.png
   :target: http://avelino.us/wp-content/uploads/2012/10/Screenshot-at-2012-10-08-174927.png
