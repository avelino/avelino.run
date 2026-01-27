---
date: "2026-01-27"
title: "LLM como Copiloto de Investigação: Debugando Produção com Claude Code e MCPs"
tags: ["claude-code", "mcp", "debugging", "observability", "honeycomb", "sentry", "production", "llm", "developer-experience"]
description: "Como uso Claude Code integrado com Honeycomb, Sentry e Slack para investigar bugs em produção de forma assíncrona. Não é sobre gerar código — é sobre ter um copiloto que cruza dados de múltiplas fontes enquanto você foca na solução."
url: "/claude-code-mcp-production-debugging"
---

Debugar em produção é um exercício de context-switching infinito.

Alguém reporta um bug no Slack. Você abre o Honeycomb pra ver traces. Pula pro Sentry pra encontrar exceptions. Volta pro código pra entender o fluxo. Consulta documentação pra lembrar como aquele serviço funciona. Enquanto isso, três pessoas te marcaram em outras threads perguntando "já viu isso?".

O problema não é falta de dados — é **excesso de contexto fragmentado**. Cada ferramenta tem uma peça do quebra-cabeça, mas montar a imagem completa exige malabarismo mental constante.

Nos últimos meses, mudei meu workflow. Em vez de ser o humano que pula entre ferramentas, transformei o Claude Code no copiloto que faz essa navegação por mim.

## O Cockpit: MCPs que Conectam Tudo

A mágica está nos **MCPs (Model Context Protocol)** — integrações que permitem ao Claude acessar ferramentas externas diretamente. Minha stack atual:

```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "honeycomb": {
      "type": "http",
      "url": "https://mcp.honeycomb.io/mcp"
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      "env": {
        "SLACK_MCP_XOXP_TOKEN": "xoxp-...",
        "SLACK_MCP_TEAM_ID": "..."
      }
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp"
    }
  }
}
```

Com essa configuração, o Claude pode:

- **Slack**: Ler threads de bug reports, entender o contexto do problema
- **Honeycomb**: Buscar traces, analisar latência, identificar gargalos
- **Sentry**: Puxar exceptions, stack traces, frequência de erros
- **GitHub**: Navegar PRs, histórico de commits, blame
- **Codebase local**: Ler o código diretamente do meu terminal

O Claude não "vê" cada ferramenta isoladamente — ele cruza informações. E esse é o diferencial.

## Um Caso Real: Queries Travando o Sistema

Sexta-feira, 17h. O pior horário. Thread no Slack: "Sistema inteiro lento, várias telas não carregam, timeout em tudo."

Esse tipo de report é o mais difícil. "Tudo lento" pode ser mil coisas: CPU, memória, rede, banco, serviço externo. Sem um ponto de entrada específico, a investigação vira caça ao tesouro.

Antes do workflow com MCPs, eu:

1. Abriria Honeycomb, filtraria por latência alta no intervalo de tempo
2. Encontraria traces lentos, clicaria em cada um tentando achar padrão
3. Notaria spans de database demorados, anotaria mentalmente
4. Abriria Sentry, buscaria exceptions no mesmo período
5. Tentaria correlacionar manualmente trace ID com exception
6. Voltaria pro código, grep pelo nome do serviço suspeito
7. Leria implementação, formularia hipótese
8. Voltaria às ferramentas pra validar

**Tempo médio**: depende. Às vezes **30 minutos**, às vezes **2 horas**. O problema não é cada passo — é manter o contexto mental entre eles.

Pedi pro Claude:

> "Sistema com lentidão generalizada nos últimos 20min. Busca no Honeycomb traces com latência > 3s, agrupa por serviço pra identificar qual está degradado. Se for banco, procura por queries lentas ou locks."

O Claude encontrou o padrão:

1. **Honeycomb**: 80% dos traces lentos tinham spans de database com duração > 5s
2. **Drill-down**: As queries lentas eram todas no mesmo serviço — relatórios
3. **Sentry**: Várias exceptions de `LockWaitTimeout` no mesmo período
4. **Código local**: Encontrou a query problemática no endpoint de exportação de relatório

O diagnóstico:

> **Causa raiz**: O endpoint de exportação de relatório executa uma query analítica pesada (`SELECT ... GROUP BY ... ORDER BY`) sem paginação. Quando dois usuários exportam simultaneamente, a segunda query fica esperando lock da primeira. A query leva ~45s para completar, e o lock_wait_timeout é 30s — resultado: timeout em cascata.
>
> **Por que afeta "tudo"**: A tabela principal (`orders`) é usada por quase todos os endpoints. Enquanto a query analítica segura lock de leitura em milhões de rows, outras operações que precisam de write lock ficam enfileiradas. Efeito dominó.
>
> **Solução proposta**:
>
> 1. Mover queries analíticas para réplica de leitura (read replica)
> 2. Adicionar índice composto para a query de relatório (`created_at`, `status`, `user_id`)
> 3. Implementar paginação com cursor no export — processar em chunks de 10k rows
> 4. Considerar materializar esse relatório em tabela separada (atualização async)

Esse caso ilustra algo importante: o Claude não só achou o problema, ele explicou **por que um endpoint de relatório afetava o sistema inteiro**. Essa conexão entre lock de leitura → block de escrita → efeito dominó é exatamente o tipo de raciocínio que exige manter múltiplos conceitos na cabeça simultaneamente.

## A Estrutura do Pedido que Funciona

Depois de semanas experimentando, identifiquei o padrão de prompt que funciona:

### O que funciona

1. **Contexto específico**: URL, horário, user ID, qualquer identificador concreto
2. **Escopo claro**: "últimos 30min", "serviço X", "fluxo Y"
3. **Pedido de diagnóstico, não código**: "me diz a causa" > "arruma isso"
4. **Qualificador de solução**: "definitiva, não paliativa"

### O que não funciona

- ❌ "Tem um bug no checkout, descobre o que é" (muito vago)
- ❌ "Escreve o fix pra esse problema" (pula a investigação)
- ❌ "Olha todos os erros da última semana" (escopo impossível)

A regra de ouro: **nunca peço código, peço diagnóstico + proposta de solução**.

Por quê? Porque código é a parte fácil. A parte difícil é entender o problema. Quando o LLM pula direto pra código, ele frequentemente resolve o sintoma, não a causa. Quando ele precisa primeiro diagnosticar, ele é forçado a construir modelo mental do sistema — e eu posso validar esse modelo antes de qualquer implementação.

## Quando Não Funciona

Seria desonesto dizer que funciona sempre. O principal limitador é **contexto muito distribuído**.

Quando o bug envolve 5+ serviços, cada um com suas próprias traces e exceptions, o Claude começa a perder o fio. Ele consegue puxar dados de cada fonte, mas a correlação entre elas fica superficial. Nesses casos, uso o workflow híbrido: deixo ele fazer a primeira triagem (eliminar hipóteses óbvias), depois assumo a investigação manual nas partes que exigem correlação complexa.

Também não funciona bem para:

- **Race conditions**: O modelo não consegue "ver" timing de execução
- **Problemas de estado**: Se o bug depende de sequência específica de eventos
- **Dados que não posso compartilhar**: Às vezes o contexto necessário é sensível demais

## O Modelo Mental Certo

O erro comum é tratar LLM como "desenvolvedor automático". Não é. É **copiloto de investigação**.

A analogia que uso: copiloto de avião. O piloto (você) decide destino, rota, quando decolar. O copiloto (LLM) monitora instrumentos, faz checklist, alerta sobre anomalias. Você não pede pro copiloto "pilota o avião" — você pede "checa pressão do óleo" ou "confirma altitude com torre".

Com debugging é igual:

- ✅ "Busca traces com latência > 5s nesse serviço"
- ✅ "Cruza esse exception com o código e me diz onde origina"
- ✅ "Lista hipóteses do que pode causar esse comportamento"
- ❌ "Arruma o bug"

## Setup Mínimo pra Testar

Se você quer experimentar esse workflow, o setup mínimo:

1. **Claude Code CLI** instalado
2. **MCP do Honeycomb** (ou sua ferramenta de observabilidade)
3. **MCP do Sentry** (ou equivalente)
4. **Acesso ao codebase** no mesmo terminal

Não precisa de todos os MCPs de uma vez. Comece com observabilidade + exceptions. Adicione Slack depois se fizer sentido pro seu fluxo.

## O Que Muda na Prática

O ganho real não é "resolver bug em 5 minutos que levaria 2 horas". Às vezes leva o mesmo tempo. O ganho é **qualidade da investigação**.

Quando eu pulava entre ferramentas, frequentemente parava na primeira hipótese plausível. "Ah, queries lentas? Deve ser índice faltando. Cria um índice." Solução paliativa. Bug volta em duas semanas.

Com o LLM fazendo a correlação, ele naturalmente continua investigando além da primeira hipótese. "Query lenta, sim, mas por quê? Tem lock envolvido? Por que essa query específica trava as outras? Qual o efeito cascata?"

A profundidade da investigação aumenta porque o custo cognitivo de manter contexto diminui.

## Conclusão

LLMs estão mudando como escrevemos código. Mas talvez o impacto maior seja em como **investigamos sistemas**.

Debugging em produção é fundamentalmente um problema de integração de contexto. Cada ferramenta tem uma peça. O trabalho humano era ser o hub que conecta tudo. Agora esse hub pode ser automatizado — não a decisão final, mas a coleta e correlação.

Se você está usando LLM só pra autocompletar código, está subutilizando. Experimente como copiloto de investigação. Configure uns MCPs. Jogue um bug report e peça diagnóstico, não fix.

Os links dos MCPs que uso:

- [Honeycomb MCP](https://docs.honeycomb.io/integrations/mcp/)
- [Sentry MCP](https://docs.sentry.io/organization/integrations/mcp/)
- [Slack MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)
- [GitHub MCP](https://docs.github.com/en/copilot/customizing-copilot/using-model-context-protocol)

A stack que montei funciona pra mim. A sua vai ser diferente. O princípio é o mesmo: **conecte as fontes de contexto, peça diagnóstico, valide antes de implementar**.
