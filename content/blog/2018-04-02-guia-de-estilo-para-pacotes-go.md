+++
date = "2018-04-02"
title = "Guia de estilo para pacotes Go"
tags = "golang, style guide, guia de estilo, packages, pacotes"
+++

Tradução do blogpost [Style guideline for Go packages](https://rakyll.org/style-packages/) escrito pela [@rakyll](https://twitter.com/rakyll).

![One code style to rule all](/one-code-style-to-rule-all.jpg#center)

Código organizado em Go é fácil de entender, usar e ler. A falta de organização em código Go é tão crítico quanto as APIs má projetadas. Os diretórios, nome e a estrutura dos seus pacotes são os primeiros elementos com os quais os utilizadores vêem e interagem.

O objetivo deste blogpost é ajudá-lo com boas práticas comuns para não definir regras ruim. Você deve sempre usar o seu julgamento para escolhe a solução mais elegante para sua implementação.


## Pacotes

Todos os códigos Go são organizados em pacotes. Pacote em Go é simplesmente um diretório (pasta) com um ou mais arquivos `.go` dentro dele. Pacotes Go fornecem isolamento e organização de código semelhante a diretórios e organização de arquivos em um computador.

Todo o código Go vive em um pacote e um pacote é o ponto de entrada para acessar o código Go. Compreender e estabelecer boas práticas em torno de pacotes é importante para escrever bom pacote (código) Go.


## Organização do pacote

Vamos começar com sugestões de como você deve organizar código Go e explicar convenções sobre a nome de pacotes Go.

### Usar vários arquivos

Pacote é um diretório com um ou mais arquivos Go. Sinta-se livre para separar seu código em quantos arquivos achar melhor para a legibilidade ideal.

Por exemplo, o pacote HTTP pode ter sido separado em arquivos diferentes de acordo com o aspecto de handles HTTP. No exemplo a seguir, o pacote HTTP é dividido em alguns arquivos: tipos do cabeçalho e código, tipos de cookie e código, a implementação HTTP real e a documentação do pacote.

```markdown
- doc.go       // documentação do pacote
- headers.go   // HTTP tipos de headers e código
- cookies.go   // HTTP tipos de cookies e código
- http.go      // HTTP implementação do cliente, request e tipo de response, etc.
```

### Manter os tipos próximos

Como regra geral, mantenha os tipos mais próximos de onde eles são usados. Isso tornará mais fácil qualquer contribuição e manutenção (para você ou outra pessoa externa) para encontrar um tipo. Um bom lugar para as estruturas de dados (*struct*) pode estar no começo do arquivo `headers.go`.

```bash
$ cat headers.go
package http

// Header represents an HTTP header.
type Header struct {...}
```

A linguagem Go não restrige onde você deve definir os tipos, uma boa prática é manter os tipos na parte superior do arquivo, dentro do pacote que ele faz parte.

### Organização por responsabilidade

Uma prática comum de outros linguagens é organizar tipos juntos em um pacote chamado *modelos* (ou algum nome nessa linha). Em Go, nós organizamos o código por suas responsabilidades funcionais.

```wrong
package models // DON'T DO IT!!!

// User represents a user in the system.
type User struct {...}
```

Em vez de criar um pacote chamado *modelos* e declarar todos os tipos de entidade lá, um tipo de usuário deve viver em um pacote de camada de serviço.

```go
package mngtservice

// User represents a user in the system.
type User struct {...}

func UsersByQuery(ctx context.Context, q *Query) ([]*User, *Iterator, error)

func UserIDByEmail(ctx context.Context, email string) (int64, error)
```

### Pensando no godoc

Não é muito facil pensar (usar) Godoc na fase inicial do desenvolvimento da API do seu pacote para ver como seus conceitos serão renderizados no doc. Muitas vezes, essa visualização tem um impacto sobre o projeto (em geral para melhor). Godoc é a forma como os usuários vão consumir um pacote, por isso é extremamente importante ajustar as coisas para torná-los mais acessíveis, tenha certeza que isso melhora a API dos seus pacotes.

### Exemplos para preencher as lacunas

Em alguns casos, talvez não seja possível fornecer todos os tipos relacionados de um único pacote. Pode ser confuso fazer isso (em uma fase inicial), você pode querer publicar implementações concretas de uma interface comum de pacote separado ou esses tipos podem ser propriedade de um pacote de terceiros. Dê exemplos para ajudar o usuário a descobrir e entender como eles são usados juntos.

```bash
$ godoc cloud.google.com/go/datastore
func NewClient(ctx context.Context, projectID string, opts ...option.ClientOption) (*Client, error)
...
```

`NewClient` trabalha com `option.ClientOptions` mas não é nem o pacote de armazenamento de informações nem o pacote de opção que exporta todos os tipos de opção.

```bash
$ godoc google.golang.org/extraoption
func WithCustomValue(v string) option.ClientOption
...
```

Caso a API do seu pacote exigir muitos pacotes **não padrão** sejam importados, é útil adicionar um [exemplo Go](https://blog.golang.org/examples) para mostrar aos usuários código de exemplo.

Exemplos é uma ótima maneira de aumentar a visibilidade de um pacote menos descoberto. Por exemplo, para `datastore.NewClient` pode referenciar o pacote de opção extra.

### Não exportar de **main**

Um identificador pode ser [exportado](https://golang.org/ref/spec#Exported_identifiers) para permitir o acesso a ele de outro pacote.

Os pacotes principais não são importáveis, portanto, exportar identificadores de pacotes principais é desnecessário. Não exportar identificadores de um pacote principal se você estiver construindo o pacote para um binário.

Exceções a esta regra podem ser os principais pacotes incorporados um `.so`, `.a` ou **Go plugin**. Em tais casos, código Go pode ser usado a partir de outras linguagens através da [funcionalidade exportar CGO](https://golang.org/cmd/cgo/#hdr-C_references_to_Go) e identificadores de exportação são necessários.


## Nome do pacote

O nome do pacote e caminho de importação são ambos identificadores significativos do seu pacote e representam tudo o que o seu pacote contém. Nomear seus pacotes canônicamente não apenas melhora sua qualidade de código, principalmente para os usuários do pacote que você esta criando/mantendo.

### Somente em minúsculas (lowercase)

Os nomes dos pacotes devem ser minúsculos. Não use `snake_case` ou `camelCase` em nomes de pacote. O Go blog tem um [guia abrangente](https://blog.golang.org/package-names) sobre a nomeação de pacotes com uma boa variedade de exemplos.

### Nomes curtos, mas representativos

Os nomes dos pacotes devem ser **curtos**, mas devem ser **exclusivos** e **representativos**. Os usuários do pacote devem ser capazes de entender sua finalidade a partir do nome, sem necessidade de ler documentação (esse trabalho não é nada fácil, mas é possível).

Evite nomes de pacotes demasiado amplos como "common" e "util".

```wrong
import "pkgs.org/common" // DON'T!!!
```

Evite nomes duplicados, à casos que o usuário precisar importar o mesmo pacote.

Se você não pode evitar um nome ruim, é muito provável que haja um problema com sua estrutura geral e organização de código, esse é um grande alerta para repensar do design da sua API.

### Claro caminho de importação

Evite expor sua estrutura de repositório personalizada aos usuários. Alinhar bem com as convenções `GOPATH`. Evite ter `src/`, `pkg/` e etc, no caminho da importação.

```wrong
github.com/user/repo/src/httputil   // DON'T DO IT, AVOID SRC!!

github.com/user/repo/gosrc/httputil // DON'T DO IT, AVOID GOSRC!!
```

### Sem plural

Em Go, os nomes dos pacotes não são plurais. Isso é surpreendente para os programadores que vieram de outras linguagens e estão retendo um velho hábito de pluralização de nomes. Não use nome do pacote `httputils`, mas `httputil`!

```wrong
package httputils  // DON'T DO IT, USE SINGULAR FORM!!
```

### Renomear deve seguir as mesmas regras

Se você estiver importando mais de um pacote com o mesmo nome, poderá renomear localmente os nomes dos pacotes. Os renomes devem seguir as mesmas regras mencionadas neste *blogpost*. Não há nenhuma regra que o pacote que você deve renomear. Se você está renomeando a biblioteca de pacotes padrão, é bom adicionar um prefixo Go para fazer o nome de auto documento que é "Go biblioteca padrão" pacote, por exemplo, `gourl`, `goioutil`.

```go
import (
	gourl "net/url"

	"myother.com/url"
)
```

### URLs personalizada (vaidade)

`go get` suporta a obtenção de pacotes por uma URL que seja diferente da URL do repositório do pacote. Estas URLs são chamados de URLs personalizadas e exigem que você sirva uma página com meta tags específicas as ferramentas Go reconhecer. Você pode servir um pacote com um domínio personalizado e um caminho usando URLs personalizada.

Por exemplo:

```bash
$ go get cloud.google.com/go/datastore
```

verifica o código-fonte de `https://code.googlesource.com/gocloud` bastidores e coloca-lo em seu espaço de trabalho (**GOPATH**) `$GOPATH/src/cloud.google.com/go/datastore`.

Dado `code.googlesource.com/gocloud` já está servindo este pacote, seria possível ir buscar o pacote a partir desse URL? A resposta é não, se você impor a URL personalizada.

Para fazer isso, adicione uma instrução import ao pacote. A ferramenta Go rejeitará qualquer importação deste pacote de qualquer outro caminho e exibirá um erro amigável para o usuário. Se você não impor os seus URLs personalizada, haverá duas cópias do seu pacote que não podem trabalhar em conjunto devido ao diferente *namespace*.

```go
package datastore // import "cloud.google.com/go/datastore"
```


## Documentação de pacote

Documente sempre seu pacote. A documentação do pacote é um comentário de nível superior imediatamente anterior à cláusula `package`. Para pacotes *não-principais*, godoc sempre começa com "Package {PkgName}" e segue com uma descrição. Para pacotes principais, a documentação deve explicar o binário.

```go
// Package ioutil implements some I/O utility functions.
package ioutil

// Command gops lists all the processes running on your system.
package main

// Sample helloworld demonstrates how to use x.
package main
```

### Use doc.go

Às vezes, os docs do pacote podem ser longa, especial quando fornecem detalhes do uso e das directrizes. Quando isso acontecer mova o pacote godoc para um arquivo `doc.go`. (consulte um exemplo de um [doc.go](https://github.com/GoogleCloudPlatform/google-cloud-go/blob/master/datastore/doc.go).)
