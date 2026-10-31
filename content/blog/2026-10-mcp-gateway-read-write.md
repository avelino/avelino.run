---
date: "2026-10-28"
draft: false
title: "An MCP gateway has to know a read from a write"
tags: ["mcp", "ai-agents", "security", "open-source"]
description: "Centralizing MCP tokens in a proxy was the easy half. The gateway only became useful when it could tell a tool that reads from a tool that writes, and that turned out to be a classification problem."
url: "/mcp-gateway-read-write"
---

In April I wrote that my MCP proxy let you say "engineer A gets no access to Slack tools", but not "engineer A can read but not write". I called it "a start, not mature access control". Six months later that sentence is the part of the post I think about most, because it was the whole problem hiding in one line.

[The governance problem MCP created without asking](https://avelino.run/mcp-governance-token-sprawl/) was about token sprawl. Every engineer had generated their own Sentry, Slack and Grafana tokens, and nobody could answer how many places we'd have to revoke when someone left. The fix was to put [`mcp serve`](https://mcp.avelino.run/guides/proxy-mode) in the middle. One endpoint for every AI client, service tokens on the server, one credential per person. That moved the tokens. It didn't decide what an agent is allowed to do with them, and that is the part that turns a proxy into an MCP gateway.

## What the gateway actually does

[`mcp`](https://github.com/avelino/mcp) started as a CLI that turns any [MCP server](https://modelcontextprotocol.io/) into a terminal command. The proxy mode came later, when I noticed every client (Claude Code, Cursor, opencode) spawns every configured server at startup and keeps it alive forever. Ten servers and three sessions is thirty idle processes. I wrote about that in [MCP servers are draining your hardware](https://mcp.avelino.run/mcp-servers-are-draining-your-hardware). The proxy runs one process per backend no matter how many clients are connected, starts a backend only when a tool on it gets called, and shuts it down when it goes idle.

That part I got wrong first. In [issue 51](https://github.com/avelino/mcp/issues/51) I had 13 live copies of the same backend on my own laptop, sockets still open to editor processes that had already died, and requests hanging on the dead ones. A gateway that leaks is worse than no gateway, because now every agent hangs together. Every spawned child is reaped on shutdown, panic or cancel now, and a dead client only loses its own request. Then [issue 77](https://github.com/avelino/mcp/issues/77) showed a `gh issue view` taking 5 to 30 seconds through the proxy on a cold start, because the first `tools/call` waited for every backend to finish discovery. [PR 81](https://github.com/avelino/mcp/pull/81) made discovery per server, so a call only waits for the backend that owns the tool.

None of that is governance. It's plumbing. But plumbing is what makes people keep the gateway on instead of quietly going back to a token in their own config. If the gateway is slower or flakier than the direct path, the direct path wins and your audit log has a hole the size of the team.

With the plumbing holding, every request carries an identity. A bearer token, a header from a trusted reverse proxy, or OAuth for clients like Claude.ai and ChatGPT. Every call lands in the [audit log](https://mcp.avelino.run/guides/audit-logging) with who called which tool on which server, how long it took and whether it worked. Arguments stay out of the log by default, because they're where the personal data lives. That answers "who did what". It still doesn't answer "who is allowed to do what".

## The real problem is that tools don't say what they do

Allow and deny by tool name is easy to build and useless in practice. Nobody wants to keep a list of 200 tool names per person. What you want to write is "devs can read Grafana and GitHub, and on GitHub they can also open PRs and issues". Read and write are the words people use when they talk about access. The protocol has almost nothing to say about them.

MCP does define tool annotations. There's a [`readOnlyHint` and a `destructiveHint` in the spec schema](https://modelcontextprotocol.io/specification/2025-06-18/schema). They're hints, they're optional, and most servers I connect don't fill them in. So the gateway has to decide on its own whether `search_issues` reads and `update_dashboard` writes.

The naive answer is a name prefix list. `get_`, `list_`, `search_` are reads, everything else is a write. It works until it doesn't. The [classifier PR](https://github.com/avelino/mcp/pull/62) says it plainly: a pure name heuristic "fails dangerously" on cases like `execute_sql`. The name doesn't tell you anything. `SELECT` reads, `DROP TABLE` writes, and both go through the same tool.

What shipped combines three sources, in this order. Manual overrides in the config, the protocol annotations when they exist, and a score built from tokens in the name, patterns in the description and hints in the input schema. Above a threshold it's a read, below it's a write, and in between it's `ambiguous`. Ambiguous is treated as write. That's the decision I care most about in the whole design. When the gateway doesn't know, it fails closed, and the person who loses access is the one who can fix it in five minutes by adding an override.

Then the [role-based ACL](https://github.com/avelino/mcp/pull/63) uses that verdict. A grant says server, access (`read`, `write` or `*`) and optionally which tools. Grants from all of a person's roles are united, an explicit deny always wins, and no match falls back to the default. With `strictClassification` turned on, ambiguous tools are blocked for everyone, admins included, until someone classifies them by hand.

## One tool, worked through to the end

The case I keep coming back to is a Databricks MCP server I run behind the gateway. It exposes two tools that matter here, `execute_sql` and `execute_sql_read_only`. Plus `poll_sql_result` to fetch the result of a long query.

Before the classifier, my options were "this person has Databricks" or "this person doesn't". An agent investigating a metric needs to run queries. It doesn't need to be able to run whatever it decides is a good idea at 2am on a production warehouse.

The first thing I did was look at what the gateway thought:

```
mcp acl classify
```

That prints the verdict, the confidence, the source and the reasons for every tool. `execute_sql_read_only` has the answer in its name. `execute_sql` doesn't, and I didn't want a score deciding it. So I pinned all three in the server config:

```json
{
  "mcpServers": {
    "databricks": {
      "command": "databricks-mcp",
      "tool_acl": {
        "read":  ["execute_sql_read_only", "poll_sql_result"],
        "write": ["execute_sql"]
      }
    }
  }
}
```

Overrides run before the classifier, so a pinned tool never gets scored, and they're re-read from the config on every start instead of cached. If two different globs on the same server match the same tool, one in `read` and one in `write`, the gateway resolves it as `write`. Same rule as ambiguous. Doubt costs access, not data.

With that in place, the role for people who investigate data is one line: Databricks, access `read`. The agent sees and can call `execute_sql_read_only` and `poll_sql_result`. `execute_sql` is filtered out of `tools/list` for that identity, and a direct call is denied. The few people who really need writes get a role that has `write` on that server, and nobody has to remember tool names.

The last step is the one people skip. Check that it's doing what you think. [PR 64](https://github.com/avelino/mcp/pull/64) added the ACL fields to the audit log, so every call records the decision, the rule that matched, the access kind and how the tool was classified, with confidence. Two queries I run:

```bash
mcp logs --json | jq '.[] | select(.acl_decision=="deny" and .acl_access_kind=="write")'
mcp logs --json | jq '.[] | select(.classification_confidence < 0.5 and .acl_decision=="allow")'
```

The first shows who tried to write and got stopped. If it's always the same person on the same tool, either the role is wrong or that person needs a conversation. The second is the one that matters more. It's the list of calls the gateway allowed based on a guess. Every line there is a tool that should get an override before it shows up in an incident review.

There's one limit I won't hide. A read-only tool is only as read-only as the backend makes it. If `execute_sql_read_only` is a wrapper that trusts the query string, the gateway labelled it correctly and still can't save you. The gateway decides which tools an agent can reach. What each tool does once it's reached is the backend's job, and the service credentials behind it should be scoped to match. Least privilege on the token, not only on the menu.

What I said in April still holds. A gateway is a single point of failure, and I'd rather have a failure I can see than an attack surface I can't. What changed is what the gateway knows. It used to know who was calling. Now it knows whether the call reads or writes, and when it isn't sure, it says no.

If you're putting agents in front of production tools this year, run your own version of `mcp acl classify` before you write the first role. Count how many tools come back ambiguous. That number is how much of your access control is currently a guess.
