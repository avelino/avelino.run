# Funções ActivityPub para avelino.run

Este diretório contém funções serverless do Netlify que implementam funcionalidades dinâmicas para o ActivityPub em um site estático.

## Funções disponíveis

- **activitypub.js**: Redirecionamento inteligente para endpoints ActivityPub
- **http-signature.js**: Implementação de assinaturas HTTP para ActivityPub
- **inbox.js**: Processamento de solicitações recebidas (follows, likes, etc.)

## Configuração

### 1. Chave privada

A chave privada (`private.pem`) deve ser configurada como uma variável de ambiente no Netlify:

```bash
# No console do Netlify
PRIVATE_KEY=`cat private.pem`
```

Para desenvolvimento local, coloque o arquivo `private.pem` na raiz do projeto.

### 2. Instalação de dependências

```bash
# Instalar dependências globais
npm install

# Instalar dependências das funções
npm run build:functions
```

### 3. Implantação

A implantação é automática com o Netlify. Certifique-se de que a configuração do site no Netlify inclui:

- Build command: `npm run build && npm run build:functions`
- Publish directory: `public`
- Functions directory: `netlify/functions`

## Estrutura

```
netlify/
├── functions/
│   ├── activitypub.js  # Redirecionamento inteligente
│   ├── http-signature.js  # Assinaturas HTTP
│   ├── inbox.js  # Processamento de atividades
│   ├── package.json  # Dependências das funções
│   └── README.md  # Este arquivo
```

## Testando localmente

Para testes locais, use o CLI do Netlify:

```bash
netlify dev
```

Isso iniciará o servidor Hugo e as funções do Netlify localmente.
