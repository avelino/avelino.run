+++
date = "2018-10-21"
title = "A arte de reescrever software"
tags = ["desenvolvimento", "software", "senior", "experiencia"]
+++

Lidar com software legado hoje em dia é mais comum do que podemos imaginar, costumo dizer que muitos softwares nascem legado, como assim?
Para mim software que não tem teste automatizado é legado, não tem como garantir funcionamento de absolutamente nada dentro dele e muitos comportamentos (recursos ou bugs) só irá aparecer com usuários usando constantemente.

![Experiencia se conquista, arquitetura de software é pratica](/blog/arquiteto-tirinha.jpg#center)


Após alinhamento do que é software legado é comum a empresa (principalmente as com cultura de startup) e desenvolvedores ter que trocar peças do software em pleno o voo, não temos como pousar o avião para fazer manutenção e depois decolar novamente quando a empresa está com clientes usando o software em produção.
Com isso vem o trabalho do engenheiro de software junto com time para fazer planejamento de trocar peças (componentes, módulos pacotes, serviços ou qual seja o nome que você de para isso) do software com ele no ar.


## Planejamento

No meu ponto de vista esse trabalho deve ser feito com muito planejamento e pé no chão, só assim conseguimos pensar nos possíveis problemas que possamos ter, mas tenha em mente que não terá como prever todos os possíveis problemas, mesmo passando meses e meses planejando, a única certeza que podemos ter é: ao colocar no ar surgirá imprevistos, bem-vindo a vida de desenvolvimento de software.

Esse é o momento de alinhamento do “problema” e possíveis soluções junto com o time envolvido, tenha certeza que todos os envolvidos entendeu o problema antes de dar o próximo passo de sair vomitando soluções e consequentemente escolher a melhor solução. Se um dos membros não entendeu o problema não deve ignorar, ele não enxergou como um possível problema ou o trabalho de expor o problema não foi claro para todos, essa deve ser a hora de praticar a comunicação entre os membros do time, geralmente não é um trabalho fácil, mantenha sempre a calma, seja objetivo e traga o time de volta ao tema quando começar sair, para mim não existe nível hierárquico para fazer isso, todos devem estar com o mesmo propósito: resolver o “problema”.

Em software usamos um termo chamado baby step (passos de bebê), ou seja, dê o próximo passo após concluir o atual (um de cada vez).


## Chegando à solução

Para qualquer “problema” existem diversas soluções e isso não é diferente no mundo de software. Lidando com software legado (contexto desse blogpost) temos que ter o equilíbrio do melhor software e da solução que resolve o que estamos buscando resolver.
Desenvolvedores geralmente quer partir para melhorar software ao nível de software, mas precisamos pesar isso com outras métricas para ver qual é a melhor solução realmente:

* Tempo
* Esforço
* Conhecimento (do time, esse é extremamente importante)

Minha escolha sempre será por uma solução que o time consiga dar manutenção e mais de uma pessoa já usou a abordagem sugerida em produção - existe um abismo enorme entre teoria e produção (infelizmente).

Esse é o momento de exercitar o conhecimento do time para escolher qual caminho seguir:

* Micro Serviço (REST, RPC ...)
* Fila de processamento
* Serverless
* Serverless + API Gateway
* Módulo, pacote, biblioteca e/ou ...
* ...

Como tudo em minha vida, tento ter mais de uma opção caso a primeira escolhida não funcione, trago essa abordagem para desenvolvimento de software também - mas já tive casos que todas as possíveis soluções não funcional e infelizmente foi momento de jogar a toalha e repensar no negócio, via software estava impossível resolver.


## Reescrevendo as peças

Dado que o time escolheu a melhor solução para o “problema” é momento colocar à teoria discutida em prática, pode ser que a primeira solução não seja possível, estava implícito algum ponto que não tinha visibilidade antes começar, infelizmente em alguns casos (e não por falta de experiência) isso acontece, principalmente quando estamos falando de software legado. Gosto da analogia cavar um buraco na areia, existem diversas ferramentas que pode “adivinhar” o que tem onde vamos cavar, mas se realmente funcionasse 100% (algumas pode chegar muito próximo desse número) não precisaríamos de arquivologista ou outras profissões seguindo essa área de atuação.


## Deploy, grande momento de ir para produção

Mesmo tudo funcionando extremamente bem em ambiente de teste, homologação ou qualquer nome que você dê, a tendência de ter imprevistos quando colocarmos o software em produção é grande, esteja preparado para ter que lidar com eles.

Algumas coisas que tento evitar (sempre que possível):

* Certifique-se se realmente tudo foi escritório teste e de fato testado por todos envolvidos nos outros ambientes;
* Deploy de sexta, ninguém do time está afim de perder o final de semana em família e/ou suas obrigações pessoais. Mas tem casos que não temos como esperar, planejamento é à alma desse ponto;
* Caso apareça problema evite ser o **super-herói** e se tranque ao seu mundo para resolver o problema e volte com a “bala de prata”;
* Caso apareça problema evite hacking no servidor de produção, tenha um plano de roll back (voltar para versão anterior) caso necessário;
* Na linha do roll back, mantenha os logs gerados no momento do crash. No calor do momento é sempre um problema lembra desse pequeno/grande detalhe;

Deixe nos comentários algumas recomendações para o pessoal que ler esse blogpost após você.
