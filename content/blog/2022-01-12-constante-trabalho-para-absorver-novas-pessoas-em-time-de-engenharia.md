+++
date = "2022-01-12"
title = "Constante trabalho para absorver novas pessoas em time de engenharia"
tags = ["team building", "open source", "engenharia", "tecnologia"]
url = "constante-trabalho-para-absorver-novas-pessoas-em-time-de-engenharia"
images = ["/blog/onboarding-engineer-team.png"]
+++

![Constante trabalho para absorver novas pessoas em time de engenharia](/blog/onboarding-engineer-team.png#center)

Desenvolver o processo de _“bordo” (onboarding)_ para uma nova pessoa em time de engenharia requer muita dedicação e manter esse processo fluido da ainda mais trabalho (gerando o mínimo de fricção).

Esse assunto é desafiador para qualquer empresa e/ou time trabalhando full time, imagina em projeto _Open Source_ que geralmente os contribuidores trabalham em seu tempo livre que ele poderia estar com sua familia ou fazendo qualquer outra coisa. Devemos deixar esse processo o mais fluido possível para que as pessoas não desanime com a complexidade para subir o ambiente e testar, até fazer sua primeira contribuição (pull request).

## Configurar o ambiente de desenvolvimento

Cada desenvolvedor de tem uma forma diferente de [configurar ambiente de desenvolvimento](https://avelino.run/conhe%C3%A7a-seu-ambiente-de-trabalho/), mesmo que seja em uma tecnologia (linguagem de programação) popular com muita documentação, extensões do editor de texto (emacs, vim, vscode, ...), etc.

Nos desenvolvedores somos acostumados com “nossa forma” de trabalhar (em geral com alguns vícios), infelizmente é comum ter resistência de mudar alguma coisa quando alguém apresentar uma forma diferente.

Na grande maioria das aplicações elas depende de recursos externo como banco de dados, API, tokens e etc, se forcar o desenvolvedor (usuário) ler toda a documentação do projeto antes de ter o primeiro contato com o projeto provavelmente perderemos o engajamento dele com o projeto, gerando algumas frustrações, como:

- eu só queria testar
- tenho que ler tudo isso para ver funcionando
- que projeto complicado
- tenho que instalar X, Y e Z serviço/software na minha maquina
- não conheço a linguagem de programação usada no projeto, qual plugins tenho que instalar no meu editor?
- ... e assim por diante.

Existem algumas ferramentas para auxiliar nos mantenedores de projeto (open source ou privado) para gerar um processo de bordo com o mínimo de fricção possível.

Deixando automatizada a configuração do editor (com todos os plugins e parâmetros necessários), todos os serviços que o projeto necessita para funcionar, variáveis de ambiente configurada, banco de dados rodando com carga inicial de dados, visualizador de dados configurados (software para gerenciar dados do banco de dados), etc.

Ao ponto do desenvolvedor **“clicar em um botão”** e _magicamente_ estar com o ambiente de desenvolvimento pronto para testar o software.

Nos últimos meses nos do _prestd_ trabalhamos em melhorar nossa documentação (esta longe de ser uma boa documentação) e remover o máximo de fricção no processo de subir um novo ambiente de desenvolvimento, algumas issues que implementamos até chegar no que temos hoje:

- [Improve local tests execution](https://github.com/prest/prest/issues/510) — é frustrante alguém querer contribuir e não conseguir rodar os testes locais (usamos testes e2e, fazendo requisições para a própria API do _prestd_), foi implementado uma forma onde os testes funcionam dentro do **docker** usando `docker-compose`;
- [Documentation: new content architecture](https://github.com/prest/prest/issues/542) — com pensamento em uma pessoa que nunca teve contato com o _prestd_ e quer testar ou usar em ambiente de produção, ambas pessoas devem entrar na documentação e conseguir fazer o que deseja (subir o ambiente);
- [Onboarding of new contributor: using devcontainer](https://github.com/prest/prest/issues/665) — preparar o ambiente de desenvolvimento com _“1 click”_ usando [devcontainers](https://code.visualstudio.com/docs/remote/containers) (suporte a [GitHub Codespaces](https://github.com/features/codespaces)).

Veja a pagina de guia de desenvolvimento do _prestd_ **[aqui](https://docs.prestd.com/prestd/setup/development-guide/#dev-container)**.

> Não é legal ter o time de engenharia trabalhando em um ambiente “hostil”, precisamos pensar mais em nosso time e deixar a experiência do time fluida.
> **pessoas > tecnologia**

## Foco no desenvolvedor (usuário)

O _prestd_ existe open source desde 2016, particularmente gosto muito do projeto e acredito que seja uma ótima solução para acelerar o desenvolvimento de uma API RESTful para banco de dados existente e principalmente desenvolvimento de uma nova API (projeto começando do zero).

Porem durante muitos anos nos voltamos para desenvolver o software e não olhava para documentação a dedicação que deveríamos, fazendo com que a base de contribuidores fosse reduzindo (existente e novos) — pessoas passaram pelo empresa/projeto (quando estamos falando de open source o turnover é ainda maior), dificilmente ficara por muito tempo, fazendo que sempre tenhamos novos colaboradores começando no projeto.

Dado esse problema comentada acima, comecei olhar para documentação com mais dedicação e as decisões toda no _prestd_ daqui para frente será pensando na experiência do desenvolvedor (usuário), respondendo as seguintes perguntas:

- Isso melhorará a experiência do desenvolvedor usar o projeto?
- Isso facilitará o uso do projeto?
- Isso facilitará manter o desenvolvimento do projeto?

Quando os 3 questionamentos for **“sim”**, seguiremos com a implementação, independente do que seja: recurso, melhorar, correção, etc.

> Versão em inglês foi publica no blog da prestd **[aqui](https://dev.to/prestd/constant-work-to-onboarding-new-members-into-engineering-team-18k0)**.
