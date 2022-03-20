+++
date = "2022-03-20"
title = "Tempo sabático focado em experiência da pessoa desenvolvedora (DevX)"
tags = ["devx", "developer experience", "sabbatical" "sabbatical time"]
url = "tempo-sabatico-focado-em-experiencia-da-pessoa-desenvolvedora-devx"
images = ["/blog/sabbatical-time-devx.png"]
+++

![devx and sabbatical time](/blog/sabbatical-time-devx.png#center)

O último _tempo sabático_ que tirei foi no final de 2018 quando sai do dia-a-dia da empresa que fundei em 2015, foram intensos 4 anos de trabalho e precisava parar para oxigenar meu cérebro.

No meio de 2019 resolvi voltar ao mercado de trabalho para aprender sobre como as empresas de tecnologia estão estruturando time de engenharia de software — vinha empreendendo desde 2012 até 2018 e estruturando time de engenharia como julgava ser a melhor forma, senti precisar ganhar experiencia com quem estava em momento de _scaleup_, fazendo com excelência o que eu queria aprender.

## Estudando sobre UX

De 2019 para cá não investi tempo para aprender assuntos "diferentes" que não necessariamente me dê ~dinheiro~. Em _dezembro/2021_ resolvi financiar meu aprendizado (passar alguns meses "sem trabalhar" e estudando) e resolvi investindo meu tempo em **Experiência do Usuário (focando na _pessoa desenvolvedora_)**.

Sendo mais específico estudei sobre os seguintes assuntos:

- Psicologia Cognitiva;
- Usabilidade e Interação;
- Interação Humano-Computador;
- Design System;
- e muitos outros assuntos relacionado a UX (não especifico para DevX).

> Todos os temas voltado para experiência de pessoas, não necessariamente pessoa desenvolvedora.

Tudo que estudo profundamente coloco em prática em um ambiente publico, geralmente uso projeto Open Source para isso, sendo contribuindo com algum projeto existente ou começando um novo projeto (~caso não existe~, é muito difícil não existir um projeto open source que faça uma parte da ideia que você não teve).

## Colocando o estudo em prática

Sou um dos criadores do [**prestd**](https://github.com/prest/prest) (simplifica abrir o banco de dados PostgreSQL como uma API RESTful), infelizmente subir o ambiente de produção para o `prestd` não era uma tarefa simples (ainda não é, mas estamos no caminho) e só de pensar em subir o ambiente para desenvolver e/ou contribuir com o projeto era ainda mais complicado — eu sentia/sinto vergonha que ajudei desenvolver um projeto com uma barreira super alta para contribuição, eu só tive essa visão após estuda sobre UX com foco em DevX. Quando tenho esse tipo de sentimento (vergonha ou algum problema) gosto de trazer os problemas para meu colo, assim tenho a oportunidade de assumir a responsabilidade de melhorar o que esta me incomodando.

Alguns passos importantes que o `prestd` deu para simplificar a vida da pessoa desenvolvedora (que quer usar ou contribuir com o projeto):

- Reestruturar a documentação com o pensamento de quem vai usar o projeto, não com pensamento de quem já conhece o projeto;
- Limitar o número de novos recursos que entra no projeto, precisamos colocar esforços nos recursos atuais melhorando a documentação e simplificando o uso;
- Simplificar a criação do ambiente de desenvolvimento, usando [`devcontainers`](https://code.visualstudio.com/docs/remote/containers) (e sua integração com [GitHub Codespace](https://github.com/features/codespaces)), `docker-compose` e permitir rodar os testes localmente (na real ele rodava localmente, mas tinha que configurar muitas coisas e até eu deixar rodar no _CI_). [Escrevi aqui um blogpost falando desse processo](https://dev.to/prestd/constant-work-to-onboarding-new-members-into-engineering-team-18k0);
- **...**, ainda temos muito que fazer/melhorar para deixar o `prestd` um software amigável para novas pessoas desenvolvedoras, mas sinto que estamos em uma constante evolução.

Quando falamos de **DevX (UX focado nas pessoas desenvolvedoras)** precisamos ter empatia com as pessoas que vão usar o software que estamos desenvolvendo, e não _"só"_ com as pessoas que conhece o projeto, devemos nos colocar no lugar das pessoas e buscar sentir o que elas sentiriam se estivesse embarcando hoje no projeto sem ter conhecimento prévio.

> O que você tem feito para deixar o software que você esta desenvolvendo atualmente mais acessível para seus usuários e novos membros do time? Lembre-se que o código é (e acredito que sempre será) um meio para chegar em algum lugar e não a linha de chegada, principalmente quando estamos falando sobre desenvolver software para outras pessoas desenvolvedoras usar - nós desenvolvedores somos pessoas que tem muito [_viés cognitivo_](https://pt.wikipedia.org/wiki/Vi%C3%A9s_cognitivo).
