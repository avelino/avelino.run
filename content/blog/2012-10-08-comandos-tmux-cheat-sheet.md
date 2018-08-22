+++
date = "2012-10-08"
title = "Comandos tmux (cheat sheet)"
tags = ["tmux", "cheatsheet"]
aliases = ["/2012/10/comandos-tmux-cheat-sheet"]
+++

[tmux]() é um software que pode ser usado para vários consoles de multiplex virtuais, permitindo que um usuário acesse múltiplas sessões de terminais separados dentro de uma janela de um único terminal ou sessão de terminal remoto. É útil para lidar com vários programas a partir de uma interface de linha de comando, e para separar os programas a partir do shell do Unix, que começou o programa. Distribuído sob uma licença BSD.

## Managing tmux sessions

```shell
tmux # start tmux server
tmux at # attach running sessions to a terminal
tmux ls # list running tmux sessions
```

## Sharing sessions between terminals

```shell
tmux new -s session_name # make new named session
tmux at -t session_name # attach to exist session (allowing shared sessions)
```

## Commands (used within a running tmux session)

```shell
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
```

## Notes

> All commands need to be prefixed with the action key.

> By default, this is CTRL-b
