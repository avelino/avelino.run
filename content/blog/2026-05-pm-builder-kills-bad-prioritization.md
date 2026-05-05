---
date: "2026-05-05"
draft: false
title: "PM builder doesn't speed up engineering. It kills bad prioritization"
tags: ["product", "engineering-management", "ai", "leadership", "cto"]
description: "The PM builder isn't invading engineering. It's killing the prioritization ritual that was always theater - and the gate that separates it from vibe coding in production."
url: "/pm-builder-kills-bad-prioritization"
---

A PM on my team opened a PR last week. No heads up, no prior meeting, no PRD. POC code, isolated environment, feature flag closed, synthetic dataset. PR description: "I ran hypothesis X with 30 beta users, metric Y moved Z%, here's the code for you to look at."

CI reviewed it in 4 minutes. Engineer approved it in 8. POC went up to a controlled environment the same day.

Two years ago this would have been a scandal. In 2026 it's the right way to operate - and [a CTO still afraid of this is afraid of the wrong thing](https://avelino.run/cto-job-changed-chair-didnt/).

PM builder isn't invading engineering. It's killing the prioritization ritual that was always theater.

## The ritual that's dying

Thursday morning, prioritization meeting. Twelve PRDs on the table, framework applied to each one, a number in a spreadsheet. Twelve untested hypotheses competing for sprint slot.

Engineering rejects not because the idea is bad. It rejects because the cost of finding out it's bad is high. The PM walks back to the table frustrated, writes a better PRD next time. Cycle restarts.

Cagan already killed this in 2020 in [Empowered](https://www.amazon.com/EMPOWERED-Ordinary-Extraordinary-Products-Silicon/dp/111969129X):

> "In a feature team, you are essentially staffed to design, build and qualify features and projects on a roadmap. The roadmap is the source of truth, and the team is measured by output."

A roadmap as a queue of approved PRDs is the definition of feature factory. It doesn't matter if the PM is good. It doesn't matter if the prioritization framework is elegant. If the unit on the table is "PRD vs PRD", you're playing the wrong game.

What changed in 2026 is that there's a real alternative. And it didn't come from the product world - it came from the collapse in the cost of generating code.

## A POC isn't a prototype. It's evidence.

Three things the 2026 discourse collapsed into the same word.

A prototype is Figma. Mockup, clickable flow, visual artifact to align the team. Useful for 15 years, still useful. Not what this is about.

Vibe coding in production is debt dressed up as speed. PM ships an MVP on Bolt, plugs in Stripe, shows it to a real customer. Base44 went down in February 2026 and the company's app was offline for 8 hours. Also not what this is about.

The PM builder's POC is something else. Functional artifact, with real or subset data, isolated environment, kill switch, TTL. **It replaces the speculative PRD on the prioritization table.**

The conversation changes. You're no longer deciding between 5 untested hypotheses. You're deciding between 2 validated hypotheses and 3 that died before they ever became a queue.

## Why this frees engineering

This is the part every defensive CTO needs to read carefully.

The PM's POC isn't the solution. It's the **validated problem**. When engineering gets "this ran with 30 users, solved problem X, now tell me the right way to do this in production", you just applied Cagan to the prioritization flow itself:

> "Empowered product teams are given problems to solve, rather than features to build, and most importantly, they are empowered to figure out the best way to solve those problems."

The engineer enters early, at the right level of abstraction. Decides architecture, pattern, production trade-off. Doesn't get a finished spec to translate into code.

Cagan has another one that kills the fear of "the PM is stepping on engineering":

> "If you are just using your engineers to code, you're only getting about half their value."

A PM handing a PRD to an engineer to code = engineering operating at half value. Always was.

The PM's POC doesn't run over the engineer. It frees the engineer from the spec-executor role they should never have had.

The defensive CTO is afraid of the wrong thing. The right fear is the opposite: continuing to treat engineering as PRD-to-code translation, now that PRDs became a commodity any LLM can generate.

## The contract

Without a gate, it's vibe coding in production. With a gate, it's a POC operating as evidence.

At Buser, the gate is simple and technical: the PM's POC goes through the same CI as engineering. No exception. The CI has automatic code review running Claude Opus 4.7 - reads the diff, compares against stack patterns, flags what's off-pattern, what touches a critical path, what smells like structural debt.

PM opens PR. Model reviews. Engineering decides whether to approve it for an isolated environment.

For engineering, it stops being a review bottleneck. POC PRs arrive pre-reviewed. Eng decides in 5 minutes whether to approve or reject. No more "let me look at this tomorrow" piling POCs in queue.

For the PM, immediate technical feedback without depending on an engineer being available. Learns the stack patterns in practice, not in an onboarding doc nobody reads. After 3 POCs the PM already knows where engineering draws the line - and where they shouldn't even try.

The rules the CI enforces:

- POC runs in a sandbox environment with feature flag closed, isolated or synthetic dataset, TTL defined in code
- POC never touches payment, authentication, sensitive data, critical production path - CI rule, not social convention
- POC validates a hypothesis, engineering rewrites with production patterns, POC dies

A POC isn't version 1. It's discard.

The PM doesn't maintain code in production. Period. If the hypothesis validates, engineering takes the **problem**, not the code. If it doesn't, delete it before the TTL expires. No zombies living in a sandbox for 6 months waiting for someone to remember.

That's the line that separates governance from theater. Social convention ("we agreed PM doesn't touch payment") fails on the first deadline pressure. CI rule doesn't fail. PR doesn't pass. Simple as that.

## Why this fits the moment

I went back to leading product at Buser in 2026 with [DHM in reverse](https://avelino.run/product-is-not-a-role-its-a-moment/): Margin first, Hard to copy second, Delight last. Operational efficiency phase post-acquisition, not scattered innovation phase.

The PM builder's POC attacks margin before anything else. You find out what's **not worth** spending a sprint on before spending the sprint. Every PRD that dies before becoming queue is capacity that's left for the problem that matters.

POC is the practical application of the principle inside the product flow - cuts expensive optionality before assuming execution cost.

---

PM builder isn't PM replacing engineering. Isn't every PM needing to become a dev. Isn't vibe coding in production. Isn't Lovable, Bolt, or v0 making MVPs that turn into product.

It's one thing only: lowering the cost of finding out what's not worth building.

PM builder doesn't speed up engineering. Engineering is already fast with Claude Code, Cursor, Copilot. The bottleneck was never the speed of writing code - it was the speed of finding out what's worth coding.

PM builder kills bad prioritization. The rest is vibe coding in search of something to do.
