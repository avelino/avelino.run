+++
date = "2018-08-19"
title = "Usando iPad Pro como laptop principal"
tags = ["ipad", "ipadpro", "laptop", "desenvolvimento", "ambiente de trabalho"]
+++

Após ler alguns blogpost sobre usar o iPad como computador principal e conversar com um amigo que trabalha no Google que usa em caso como **"main laptop"**, resolvi estudar os apps para iOS que eu teria que usar para atender a minha demanda do dia a dia como gestor e desenvolvedor.

Como sempre a Apple faz um ótimo trabalho nos seus produtos, sempre pensando na simplicidade de uso do seu cliente final, ou seja, isso ajuda o onboard em qualquer dispositivo/software deles. Nem tudo são flores, ao deixar algumas coisas muito óbvias acaba confundindo (no começo) quem vem da experiência de usar um laptop para um iPad, mas acredita que em alguns dias (no meu caso 1 semana) já estava extremamente acostumado com o meu ambiente e clicando com o dele como não houvesse amanhã!

{{< instagram Bi7dBMhlYMI hidecaption >}}


## Mas é possível desenvolver usando o iPad?

Bom vamos lá, deixa eu contextualizar como era meu ambiente de desenvolvimento antes de responder essa pergunta.

Eu usava um Macbook de 12’ com a seguinte configuração:
Processador: i7
Memoria: 16GB RAM
Disco: 512GB ssd
Cor: Ouro Rose (por escolha própria, muitos me questionava pela cor dele, mas eu simplesmente gostei, até o atendente da Apple perguntou se seria para a minha esposa 😕)
Era um super avião em poder de processamento e extremamente portátil, mas nem tudo é era tão bom como esperado, algumas coisas previstas, mas outras não. Um USB-C, acabei-me acostumando, pois usava a dock station DELL WD15 quando estava em casa para ligar monitor externo (HDMI ou VGA), ethernet, USBs e etc, o problema que vejo é a tela quando estou na rua (fora do home office), ela é meia “mole”, isso acontecia em um MacBook Air 11’ que tive no passado, acredito que isso seja uma feature não bug para Apple.

Com essa máquina eu sempre mantive o meu ambiente de desenvolvimento remoto, isso mesmo, tudo em um servidor conectando via mosh (ssh com menos buffer, leia mais sobre aqui [MOSH](https://mosh.org/)), a anos não uso IDE para desenvolver software passando com alguns editores que roda em console (sem interface gráfica), VIM durante muitos anos (eis que surgiu o [vim-bootstrap](https://vim-bootstrap.com/)) e hoje EMACS (acredito que isso seja assunto para outro blogpost kkkkk).

 Dia a dia de desenvolvimento é entorno das seguintes tecnologias:

- Go
- Python
- Clojure (quando preciso rodar alguma coisa em JVM)
- TypeScript (quando preciso mexer em forntend, mas tento correr disso sempre que posso, sorry)
- [Rum](https://www.rumlang.org/) (brinquedo que ultimamente não estou com tempo de brincar 😞)

Olhando as tecnologias acima é possível se virar bem sem interface gráfica, Clojure dando um pouco mais de trabalho por causa da JVM (build dá um pouco de trabalho, IDE existe click build 😋), mas é possível.

Agora respondendo a pergunta “é possível desenvolver usando o iPad?"
Para a minha necessidade atual sim, lógico que levou um tempo (julgo anos) até conseguir viver sem uma interface gráfica para desenvolver, hoje eu consigo me virar super bem.


## Porque escolher o iPad como computador principal?

Escolha pelo iOS como ambiente principal foi após olhar se todos os aplicativos que eu precisava seria possível ter no iPad. O meu dia a dia estava mais em ferramentas office que desenvolvimento de software.
Sou CTO da [Nuveo](https://nuveo.ai/) (empresa que trabalha com Inteligência artificial) e o meu dia estava se resumindo em reuniões (texto que foi dito dentro da reunião), detalhamento de história para o time técnico transformar em software, criação de diagrama (forma de expressar ideia em fluxo), desenvolvimento de software (ssh/mosh) e responder muitos emails. Não consigo ficar tão longe de desenvolvimento de software, como leu no tópico anterior eu mantinha o meu ambiente de desenvolvimento remoto, isso tornou (100%) viável a minha ida para um iPad Pro.


- Reunião: Existem muitos apps para anotações e muitos deles dá suporte a iPencil ("caneta" da Apple);
- Criação de diagrama: iPad, combinado com a iPencil e Apps que existem para esse fim a atividade de criação de diagrama fica extremamente dinâmica e fluida;
- Desenvolvimento (ssh): Tem algumas clientes ótimos para ssh e mosh, onde não deixa a desejar para openssh cliente em laptop;
- Ferramentas office (responder email): iOS está muito bem servido para ferramentas de escritório iWorks (Number, Pages, Keynote e etc) e Office 365 (Microsoft Office), cliente de email existem muitos (alguns extremamente completo), cloud store (Dropbox, Google Drive e iCloud).


## Acessórios

Existem diversos acessórios que ajuda a auxilia no uso diário do iPad, segue abaixo a lista de acessórios que eu usava:

- Smart Keyboard
- iPencil
- Adaptador Lightning HDMI (monitor externo)
- Logitech Create Backlit Keyboard Case (substitui pelo Smart Keyboard, não achei muito portátil para carregar, fica muito grande)

Existem muitos acessórios para deixar o iPad mais laptop.

{{< instagram Bh2A6fklhiL hidecaption >}}


## Apps?


- Blink: Cliente mosh e ssh (super recomendo)
- SSH Tunnel: Criar tunnel ssh (proxy)
- OpenVPN: Cliente para VPN
- 1Password: Não consigo viver sem ele hoje em dia 😄
- MIHTool: Developer Tools do Browser
- Safari: Poderia usar o Chrome, mas no iOS não liberar trocar o browser padrão (acredito que isso irá se manter até eles levar um processo)
- Airmail: Cliente de email
- ProtonMail: Cliente de email pessoal (criptografado)
- PivotalTracker: Gestão de tarefa usada na Nuveo
- Dropbox: O meu “File System”, dado que o iOS não libera acesso no FS do iOS
- Documents by Readdle: Conecta em diversos Cloud Store
- Editorial: Editor de markdown (texto) com sync no Dropbox
- Notability: Editor com suporte a iPencil
- Telegram: Comunicação pessoal
- Slack: Ferramenta de chat usado para comunicação interna na Nuveo
- Lucidchart: Ferramenta de diagrama
- MindMeister: Ferramenta de mind manager
- appear.in: Vídeo conferência
- Google Meet: Vídeo conferência
- Skype: Vídeo conferência
- MUDRammer — Cliente MUD (game via telnet)

Acredito que eram esses apps que usava no dia a dia.

{{< tweet 995347319422930946 >}}


## Para qual uso eu recomendo o iPad?

Esse é um assunto extremamente complicado dado que o iPad Pro não é um hardware barato e sim um hardware de “luxo”.
Para quem quer um hardware para navegar na internet e utilizar ferramentas offices acredito que seja uma escolha ideal (se não entrarmos em relação do valor).


## Continuo usando o iPad?

Costumo dizer que ter um iPad Pro é um ambiente de luxo, consegue viver sem ele, mas tenha certeza que como qualquer ferramenta boa ganha dependência extremamente fácil e rápido.
Passei 2 meses usando diariamente o iPad para todo o tipo de trabalho até ir em cliente onde tive que passar o dia desenvolvendo (via 4G, o cliente não tinha WIFI liberado para terceiro).
Um dos motivos claros que me fez deixar o uso do iPad (vendi 😞) foi a falta do trackpad (achei extremamente triste isso), acostumei viver clicando na tela, mas particularmente não é para qualquer momento, mouse ainda é mais prático — pelo menos para mim — para o meu filho de 5 anos tenho certeza que ele prefere clicar na tela. “Uso do iPad no colo”, não é muito confortável usar o iPad no colo com o Smart Keyboard (nem Logitech Create Backlit), é possível não pratico.

Hoje estou usando MacBook Pro de 13 com TouchBar (não consegui acostumar com ele ainda 😞), praticamente o mesmo tamanho e peso do meu iPad Pro de 12.9 com case/keyboard. Sinto falta da praticidade de expressar coisas com iPencil, mas é possível viver sem.


## Ambiente de desenvolvimento

{{< tweet 987807646911815680 >}}

Como comentei eu conecto em servidor remoto, ou seja, uso Debian Sid e instalo tudo que preciso lá, assim nada fica local na iPad e/ou laptop.

### Configuração necessaria

{{< tweet 987718970563284992 >}}

### Outros blogposts

{{< tweet 986326731085803521 >}}

Recomendo ler esse blogpost: [Conheça seu ambiente de trabalho](https://medium.com/@avelino0/conhe%C3%A7a-seu-ambiente-de-trabalho-cf16f8cd555a)
