Entendendo na pratica como funciona a linguagem Go
##################################################
:date: 2011-05-25 22:14
:author: avelino
:category: Go
:slug: entendendo-na-pratica-como-funciona-linguagem-go

A linguagem Go é um projeto open source para tornar os programadores
mais produtivos.

Go foi desenvolvido para utilização maxima do CPU, tornando um processo
simples para criar aplicação Multithreaded, o processo de utilização de
maquinas na rede para processar determinado programa também é bem
simples, assim tornando um software mais flexível e modular.

Vamos montar um servidor HTTPD em Go.

::

    package main

    import (
        "http";
        "io";
        "fmt";
    )

    func HelloServer(c *http.Conn, req *http.Request) {
        io.WriteString(c, "hello, world!\n");
    }

    func main() {
        fmt.Printf("http://localhost:8080/hello\n");
        http.Handle("/hello", http.HandlerFunc(HelloServer));
        err := http.ListenAndServe(":8080", nil);
        if err != nil {
            panic("ListenAndServe: ", err.String())
        }
    }

| O *HelloServer()* é o que vai fazer a parte de renderização, o *man()*
ele sobre o servidor HTTP na porta 8080, e caso o usuário tente
processar um URL que não esteja no *fmt* ele vai cair no *err* onde vai
processar o erro e apresentar o *panic*.
|  Simples assim já temos um servidor HTTP para toda HTTP.
