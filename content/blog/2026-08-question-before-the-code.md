---
date: "2026-08-01"
draft: false
title: "The question has to exist before the code does"
tags: ["engineering", "ai", "outl", "mcp", "decision-making"]
description: "Writing software got cheap enough that building something to throw it away is now the sane move. What did not get cheaper is knowing what would make you throw it away, and that has to be written down first."
url: "/question-before-the-code"
---

I shipped outl's first sync on iCloud Drive knowing I would delete it.

Not suspecting. Knowing. iCloud has no Linux, no Android, and no answer for anyone who does not want their notes on Apple's servers. It was never going to be the network outl shipped on. I built it anyway, ran it for a month, then [tore it out and put QUIC in its place](https://avelino.run/from-icloud-to-peers/).

Ten years ago that is a stupid way to spend a month. Today it is the cheapest way to buy the only answer that mattered.

## The question existed before the transport did

I had one thing to find out. Does this CRDT converge across two real devices, not two processes on my laptop pretending to be peers?

That question is binary and it is answerable without writing a line of networking. Drop the per-actor `ops-*.jsonl` files in the ubiquitous container, let Apple's daemon push them between machines, watch two replicas merge. A borrowed file-pusher, exactly right for that job and wrong for every other one.

It converged. The moment it did, the scaffold had nothing left to buy and I took it down.

**Write the question first and the throwaway has an exit condition.** Skip it and the throwaway becomes the thing you ship, because nobody ever declared what would make it done.

## Implementing became the cheapest way to find out I was wrong

Last week I implemented the new MCP revision in [my proxy](https://github.com/avelino/mcp) and threw away two models of the problem in one afternoon.

The first was the version probe. I modelled it as a `Result`, worked or it didn't, which is what any sane person writes. A stdio backend that exits on an unknown method proved it wrong. A peer that ignores you and a peer that died look identical to a `Result` and demand opposite responses, so the probe has four outcomes now, not two.

The second was the `Mcp-Name` header. I percent-encoded it, because that is the obvious thing to do with a URI. Wrong again. The spec mandates a Base64 sentinel, and `%` is an ordinary character in a header value, so my encoding was the thing desynchronising the two sides.

Neither of those is a thing I reason my way into. I reasoned my way into the wrong one twice, confidently, and the code is what told me. [I wrote about that whole compatibility mess](https://avelino.run/absence-is-the-compatibility-contract/), and the part I keep coming back to is how little each wrong turn cost. An afternoon each. In 2015 that is a design doc, three people in a room, and the wrong answer defended for a quarter because someone already sank a month into it.

## Without the criterion, three implementations are three opinions

Cheap to build is not the same as cheap to judge, and the second half is where this falls apart.

Our TMS is about to start selling seats inside other companies' websites. Something has to answer "is there a seat on this route, at this time, for this price" thousands of times a day, and almost none of those questions becomes a booking. Three ways to serve that, and on paper each one defends itself.

- **Synchronous pull.** The partner hits our core on every search. Always fresh, zero divergence.
- **Edge replica.** We publish inventory and price snapshots, search resolves at the edge, only the booking reaches the core.
- **Full feed.** The partner ingests a periodic dump and serves from their own base. The classic GDS model.

I have no argument that settles this and nobody else in the room does either, which is the tell. The answer depends on how a partner's traffic actually behaves and none of us has ever seen that traffic. So four numbers, written down before any of the code.

- **Booking conversion on the channel.** Primary.
- **Failure after selection.** The passenger picked a seat and got an error. Counter-metric, and without it cache wins by default.
- **p95 search latency.** A large partner has a short timeout and drops you from results without telling you.
- **Infra cost per thousand searches.** Guardrail.

I have a guess for each one. Synchronous pull looks reliable and too expensive to survive the channel's margin. The feed looks cheap and wrong on exactly the routes that fill fast, which are the routes that matter. There are frictions in there I have not thought about yet, and that is the whole reason the four numbers exist instead of my guesses.

Agree on them after the fact and every implementation wins. Synchronous pull wins on reliability. The feed wins on cost. The edge replica wins on balance. Three narratives, and the decision goes to whoever argues best on Thursday.

**A metric picked after the result does not measure anything, it justifies.** That is how "just build it and see" turns into a way of avoiding thought instead of a way of doing it. You trade a week of reasoning for six weeks of code and you are still deciding by vibe, except now you have three codebases to maintain the vibe with.

AI is what made building three affordable. It did nothing for the part where you define what winning means. Instrumentation, real traffic, isolating one variable from another, all of it still costs what it always cost, which makes it the expensive half of the work now. Most teams still file it under paperwork.

## Only the survivor goes to review

A month ago I wrote that [reviewing is not understanding](https://avelino.run/reviewing-is-not-understanding/), that writing code builds the theory of the program and reading it only recognises the shape. Building things to throw them away should read like a contradiction of that.

It is not, as long as one rule holds. Whoever builds the throwaway is the one who validates it, and only what survives opens for review.

I wrote the iCloud transport, so I carry the theory of why it converged and what it could never do. Nobody reviewed it, because there was nothing to maintain. The comparison happened inside the head that built both sides of it, which is the only place a comparison like that can happen.

The pull request for what survives is not just what survives. It carries what was measured, what the discarded version returned, and why it lost. That is the dead theory turned into text, which is what Naur says the source code will never hold on its own.

Get the order wrong and the bill arrives anyway. Three branches open for review, nobody holding the theory of any of them, and the prototype becomes production while everyone is still arguing about indentation.

## Throwing away is cheap only where the data model is not involved

Swapping iCloud for QUIC touched zero lines of the CRDT. The op log did not change, the on-disk format did not change, client call sites did not move. That is not luck. It is the bill I paid a year earlier by refusing to let any state that has to converge live anywhere but the op log.

I never prototyped three op log formats to see which one felt better. That decision I made by thinking, slowly, before writing anything, because getting it wrong means migrating every replica of every user and no amount of cheap code touches that cost.

Same project, two decisions, opposite methods. The transport was disposable because rollback was one trait implementation. The log was not, and no AI made it so.

Every project has both kinds and confusing them costs in both directions. Prototyping what is already obvious burns weeks. Reasoning about what only real traffic can answer produces confident fiction.

The question is how you tell which one you are in. If you can write down what would make you delete it, build it today. If you cannot, you are not running an experiment.

You are just producing opinions with a build step.
