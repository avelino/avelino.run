+++
date = "2012-06-23"
title = "Criando package (modulo) em Node.js"
tags = ["nodejs", "javascript", "node"]
aliases = ["/2012/06/criando-package-modulo-em-node-js"]
+++

Existe muitas pessoas querendo estudar Node.js pela simplicidade de trabalhar com processamento assíncrono e por usar JavaScript em server side. JavaScript é uma linguagem simples mas para desenvolvimento Client side mas ao mesmo tempo quando colocamos JavaScript do lado do servidor começa a surgi algumas duvidas como: estrutura do software, como criar biblioteca, qual Framework usar e muitas outras.

Dando uma olhada no Github vi que tem muitos software que parece uma lingüiça com mais de 500 linhas em um mesmo arquivo, aí me vem a seguinte pergunta "JavaScript não é orientado a objeto?" logicamente que sim, então tem alguma coisa errada pois uns dos paradigma é dividir funcionabilidade onde cada modulo faça sua parte e usando todas faz o que foi proposto a ser feito.

Então vamos lá, seguindo um exemplo simples:

* Conectar em um banco de dados
* Fazer insert, update e delete
* Desconectar do banco de dados

O exemplo usado encontra-se no repositorio ["example-nodejs-mongodb (*desculpe, acabei apagando o repositorio no passado :/*)"](https://github.com/avelino/example-nodejs-mongodb) na minha conta do Github, nesse exemplo vou usar o banco de dados [MongoDB](https://www.mongodb.com/) por ser mais simples de instalar e usar (Pois é um banco de dados NoSQL) . Dado que já esteja instalado o MongoDB em seu sistema operacional (Para usuarios Linux basta baixar o source do MongoDB no site e depois rodar o binario mongod, já para usuarios Windows não tenho não tenho experiencia no ambiente mas achei esse tutorial que pode ajudar). A instalação do NodeJS e NPM no [Linux](http://vinteum.com:80/instalando-nodejs-no-ubuntu) e [Windows](http://mateussouzaweb.com/blog/nodejs/tutorial-instalando-nodejs-no-windows) é uma operação relativamente simples, por isso não vou detalhar todo o processo, você pode ver nos artigos nesse blogpost.

A primeira coisa que temos que ter em mente é que tudo o que é escrito dentro de um package (proprio) não é levado para fora, você precisa especificar o que realmente quer expor do seu package. No arquivo `mongocon.js` temos um exemplo de como trabalhar com exports no Node.JS:

```js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/avelinous');

exports.mongoose = mongoose;
```

No exemplo acima estou expondo toda a classe do mongoose, eu poderia restringir export só alguns metodos por exemplo:

```js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/avelinous');

exports.mongoose_schema = mongoose.Schema;
```

Assim podemos limitar o acesso dentro de um package.

Caso queira fazer um package e expor publicamente via NPM, basta criar um package.json juntamente com o seu source, assim pode colocar dependencias que o seu package tem e em qual versão do NodeJS ele roda, veja o exemplo de um package.json:

```json
{
    "name": "mongo_test",
    "description": "A package using mongoose ODM",
    "author": "Avelino <t AT avelino DOT run>",
    "dependencies": {
        "mongoose": ">= 2.7.0"
    },
    "engine": "node 0.6.19"
}
```

Pronto, com isso é facil enviar o seu package para o repositorio do NPM.
