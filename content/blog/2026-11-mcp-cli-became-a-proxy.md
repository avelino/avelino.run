---
date: "2026-11-08"
draft: false
title: "I shipped a CLI and what I run is a proxy"
tags: ["mcp", "ai-agents", "open-source", "buser", "infrastructure"]
description: "My README still opens by calling mcp a CLI. The proxy landed the next day, seventeen commits in, and today it carries 196 thousand requests in a day as an internal tool at Buser. Production found bugs eight months on my own laptop never could."
url: "/mcp-cli-became-a-proxy"
---

The first line of my own README says [`mcp`](https://github.com/avelino/mcp) is a CLI that turns [MCP servers](https://modelcontextprotocol.io/) into terminal commands. That was true on March 15th, when I pushed the first commit. The proxy landed the next day, seventeen commits in, as a feature. Eight months and 158 commits later, the feature is the thing I run, and the README still leads with the smaller half.

At [Buser](https://www.buser.com.br/) it runs as an internal service behind `mcp.buser.io`. In a single day Cloudflare counted 196,270 requests and 6.79 GB of traffic through it. That is a little over two requests a second sustained across the day, about 8,200 an hour, averaging 35 KB each. A lot more than a ping.

There is a second number on that dashboard I keep looking at longer. Zero visits. Zero percent cache hit rate. Nobody opened a browser, and nothing that came back was worth storing. Every one of those requests is an agent calling a tool and waiting on an answer that exists for that call and no other.

## What the proxy is for

I have written the why twice already, so I will not do it a third time. [MCP servers are draining your hardware](https://mcp.avelino.run/mcp-servers-are-draining-your-hardware) is the resource argument. Every client spawns every configured server at startup and keeps it alive, so ten servers and three sessions is thirty idle processes. The proxy runs one process per backend regardless of how many clients connect. [The governance problem MCP created without asking](https://avelino.run/mcp-governance-token-sprawl/) and [An MCP gateway has to know a read from a write](https://avelino.run/mcp-gateway-read-write/) are the access argument. Service tokens on the server, one credential per person, and an ACL that knows whether a tool reads or writes.

Both of those I wrote as a person solving his own laptop problem. What changed this year is that other people's agents started depending on it while I slept.

## Production rewrites the backlog

Of the twelve issues open on the repo right now, seven are prefixed `serve:`. Twenty eight of the 158 commits touch `src/serve/`. I did not plan that split. It is just where the bugs are, because it is where the traffic is.

The one I closed this week is the clearest example of what a single user cannot see. In [issue 144](https://github.com/avelino/mcp/issues/144), a cancelled request kept running on the backend.

A client gives up on a long `tools/call` and sends `notifications/cancelled`. That notification is a separate message with no `id`. My stdio loop parsed every incoming line as a `JsonRpcRequest`, whose `id` is mandatory, so a notification could never parse into one and nothing ever looked at its method. Every cancellation the proxy ever received was dropped on the floor. The client walked away, the proxy held the slot and the connection, and the backend kept working and kept billing per call.

That bug was there for eight months. On a laptop you never notice, because when you give up on a tool call you close the terminal and the whole process tree dies with it. Put the same code behind one shared endpoint and a cancelled request is quota someone else is paying for.

The fix was not the interesting part. The interesting part is that fixing it exposed a second bug I had shipped the week before, in the commit that added the registry the cancellation needed. `watch::Sender::send` in Tokio refuses to write the value when no receiver is alive, and my token held no receiver of its own. So `cancel()` set nothing. Two tests hung instead of failing, and the test I had written to prove that one identity cannot cancel another identity's request passed for the worst possible reason. Nothing was cancelling at all.

I only caught it because the suite hung. If `cancel()` had silently done nothing and the tests had stayed green, that assertion would have sat in the repo looking like access control.

## What I am not going to claim

The p95 time to first byte on that dashboard is 4.2 seconds. That is not a page load and it should not be read as one. A `tools/call` through the proxy waits for whatever the backend waits for, and some of those backends are querying a warehouse. The proxy adds routing, auth and an audit write. The seconds belong to the work.

Same day, 0.18% of those requests answered 5xx. That is roughly 350 failures, and I am not going to pretend a shared endpoint makes them cheaper than they were when everyone held their own tokens. It moves them. One proxy having a bad minute is every agent in the company having a bad minute, which is the trade I took knowingly and wrote about in April. A failure I can see beats an attack surface I cannot.

The CLI is not dead either, and I would not remove it. It is how I debug the proxy. When a tool misbehaves through the gateway, the first thing I do is call it directly with `mcp <server> <tool>` and find out which side is lying.

What I would do differently is admit the shape earlier. I spent months writing documentation, a Homebrew tap and a release pipeline for the front door nobody uses, while the thing carrying real traffic was documented in a 37 kilobyte guide most people never reach.

If you maintain something and the issue tracker has drifted toward one prefix, that is the project telling you what it became. Mine said `serve:` seven times out of twelve before I was willing to read it.
