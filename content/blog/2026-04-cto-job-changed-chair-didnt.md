---
date: "2026-04-23"
draft: false
title: "The CTO's job changed. The chair didn't"
tags: ["cto", "ai", "engineering-management", "leadership"]
description: "Atlassian replaced its CTO with two 'next generation AI talent'. The point isn't the headcount. It's that the CTO's job has changed and most people haven't noticed."
url: "/cto-job-changed-chair-didnt"
---

Every company exists to deliver value. When the way we build, lead, and ship accelerates, the team has to accelerate with it. Holding the hand of someone who doesn't want to walk at the new pace doesn't help anyone. Not the person, who stays in a role that's no longer theirs. Not the team, carrying dead weight. Not the company, paying the price of your omission. Looking out for what's best for the company sometimes means, yes, letting people go. Not out of cruelty, out of honesty.

In March, Atlassian [laid off 1,600 people](https://thenextweb.com/news/atlassian-is-cutting-1600-jobs-and-replacing-its-cto), removed the CTO who had been in the role for almost four years, and placed two executives in his seat, described by the company itself as "next generation AI talent". The stock rose 2% in after-hours trading. It made headlines for the number.

In February, Sam Altman said publicly that fewer than 1% of 2025 layoffs can be directly attributed to AI. He called the rest "AI washing": cost-cutting wearing a transformation costume. The Atlassian case probably has a bit of both. Which proportion doesn't matter. What matters is what the move reveals about how the market is reading the role.

The point isn't having one, two, or ten CTOs. The point is that the CTO's job changed and most people haven't noticed.

Until 2023, a CTO optimized team throughput. More people, more code, more features. Leverage came from hiring well and scaling process. Today the machine writes decent code on its own. The constraint shifted from "can we build this" to "is this worth building, in this order, now". It shifted from capacity to judgment. That changes five things in the chair's day-to-day.

## 1. Context gatekeeping became architecture

LLM without context is a convincing garbage machine. Whoever decides what goes into the prompt, which MCP connects where, what data the AI sees, is drawing the real architecture of the company today. It isn't tooling work. It's a top-level decision.

At Buser, this starts with me laying the path for the team. Not because it's exclusively my job, but because with AI, writing code stopped being rocket science, and the effort from idea to POC in production has dropped dramatically. We run an MCP proxy ([`mcp.avelino.run`](https://github.com/avelino/mcp), open source, maintained by me) because token sprawl between engineering and business areas was escalating with no governance. I built a skill for Claude to learn the Buser domain and answer business questions from managers with our own context, not generalist-model guesswork. When the cost of prototyping drops, the top of the pyramid needs to prototype. Every decision about what the AI sees of production is an architectural decision on security, cost, and quality at the same time. You can't delegate that to the platform team and call it done.

## 2. Review goes deeper than writing

Production speed exploded. Judgment speed has to keep up. If it doesn't, it becomes accountability debt, nobody knows who decided what.

The [DORA 2025 report](https://dora.dev/dora-report-2025/) exposed the paradox: higher AI adoption correlates with more throughput *and* more instability at the same time. Faros AI, measuring 22,000 developers, found a 242% increase in incidents per PR. The tool amplifies what's already there, good and bad. In practice, I read more PRs deeply today than I did two years ago. Where I used to trust the process, now I pull context. Code review stopped being a quality gate and became an understanding gate. If the dev who opened the PR can't explain why the code looks the way it does, it doesn't matter that CI passed.

## 3. Marginal cost per decision entered the boardroom

Cheap AI turns expensive fast when nobody's measuring. I wrote about this recently in [AI tools have a cost problem. But it's not the tools](https://avelino.run/ai-cost-discipline/): the problem isn't the token price, it's the discipline of cross-referencing DORA with cost per shipped feature, not per dev, not per hour.

At Buser, every AI tool rollout goes through a cost calculation before expansion. A vendor contract that won't do pure pay-per-use leaves the table, regardless of the discount promised on the subscription. Subscription without measured return is debt dressed up as productivity. Marginal cost per engineering decision now shows up in board conversations the same way infra cost does. A CTO who doesn't know the marginal cost of an AI-assisted feature has become a bad CFO. It's not optional.

## 4. Product and engineering collapse

When the question shifts from "how do we build" to "is it worth building", splitting the two seats becomes overhead.

I went back to leading product at Buser in 2026 exactly because of this. I framed the return using DHM (Delight, Hard to copy, Margin) in reverse order: margin first, because the moment calls for efficiency before delight. It's not regression, it's reading the game. When AI solves the "how" for two-thirds of the backlog, the bottleneck becomes prioritization. Good prioritization needs to see product and engineering at the same time, on the same neck. Splitting creates handoff, handoff creates lag, and lag in 2026 costs far more than it did in 2022.

## 5. Open source became personal R&D

Test the model, the workflow, the MCP in a public sandbox before proposing it to the company. Zero risk to the company, compound learning for me.

Every project I actively maintain today (`mcp`, `jbundle`, `roam-tui`, `chrondb`) serves two functions: real contribution to the community and a personal engineering lab. When the MCP proxy had a zombie process leak in production, I debugged [issue #51](https://github.com/avelino/mcp) in my own repo, and the learning came back to Buser the following week already as an architectural decision, not as an experiment. A CTO without a public sandbox in 2026 depends 100% on the company's budget to learn. At AI pace, that's too slow.

## The return to the human

None of this is solved by replacing people without replacing practice. Atlassian may have gotten the 10% cut right and gotten the other 90% wrong by keeping the same operating mode. I don't have the data to know, and it doesn't matter for the argument. What matters is that the CTO role, from here on, is judgment per unit of time, not throughput per unit of team.

Back to the opening: letting people go is part of the job. Not as a first move, as a last one. First comes honest conversation, clear expectations, time to adjust. Those who want to keep up with the new pace find help. Those who don't find a dignified exit. Both paths are respectful. What's not respectful is keeping someone in a role that no longer exists the way it used to, paying yesterday's salary to solve tomorrow's problem with a tool that's been left behind.

A CTO who keeps optimizing throughput in 2026 won't lose the seat because of AI. They'll lose it for solving the wrong problem, at the wrong speed, in a world that already changed the question.

---

Here's the honest provocation, no attack, just a straight read: how much of your work today is automatable by AI? And more importantly, how much have you changed the way you work in the last six months?

If the answer to the second question is "little" or "nothing", the answer to the first doesn't matter. **You're already in line.** There's still time to step out, but stepping out requires admitting you're in it.
