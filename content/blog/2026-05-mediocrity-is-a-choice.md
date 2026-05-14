---
date: "2026-05-14"
draft: false
title: "Mediocrity Is a Choice"
tags: ["career", "ai", "engineering", "leadership"]
description: "Career planning is the polite way to outsource your own evolution. Mid-level is not a position, it is a pause that became permanent. AI made the pause expensive."
url: "/mediocrity-is-a-choice"
---

Career planning is the most childish thing an engineer can ask a company for. It is the polite way to outsource your own evolution to whoever happens to be paying your salary. Mid-level is not a position you reach. It is a pause that became permanent. And in 2026, AI made that pause expensive enough that you can no longer pretend it is invisible.

This is not about layoffs. It is about something quieter and more honest. The shape of an engineering career broke, and most people in the middle have not noticed yet.

## Over-engineering is people, not architecture

In January, [CACM published a piece](https://cacm.acm.org/blogcacm/how-over-engineering-became-the-new-technical-debt-in-distributed-systems/) arguing that over-engineering became the new technical debt in distributed systems. Services degrade silently. Dashboards stay green. Traces look clean. Latency climbs anyway. The article describes the symptom well: defensive microservices, abstractions for scenarios that never arrived, configuration replacing code. It is correct about the what. It is silent about the why.

[Conway's Law](https://www.melconway.com/Home/Committees_Paper.html), in its original form, says systems mirror the communication structure of the organizations that build them. The inverted version is more useful in 2026: organizational structure creates the complexity that justifies its own existence. One microservice per team. One layer per hierarchy. One internal tool per staff engineer who needs 'ownership' for their next promotion cycle. The architecture is not wrong. The people who chose the architecture are afraid.

There is a layer deeper than promotion-seeking, and almost nobody writes about it. Complexity is also territorial. Building a black box that only you understand is defensive, not offensive. It guarantees that nobody can take what is yours. Entry-level engineers do not do this because they do not know how. Senior-level engineers who have actually operated what they built for three years do not do this because they know the cost. The middle does it because the middle is where fear lives. ([cto-job-changed-chair-didnt](https://avelino.run/cto-job-changed-chair-didnt/))

## The pyramid broke

The traditional shape was a pyramid. Entry-level at the base. Mid-level in the middle, translating senior intent into entry-level code. Senior-level at the top, deciding and owning. The pyramid worked because translation took time, and translation was a job.

AI ate the translation layer. Not slowly. Abruptly.

What survives makes sense:

- **Senior-level**: decides, contextualizes, carries accountability all the way through production and post-mortem. AI accelerates this work. It does not replace it.
- **Entry-level**: learns faster than ever before. AI as a 24/7 tutor, plus direct mentorship from senior engineers without a middle layer filtering the conversation. The eighteen-month senior is real now. Four years was always an artifact of the pyramid, not of the work.
- **Mid-level**: was a bridge. AI became the bridge.

This is not 'fire all mid-level engineers'. It is 'stop creating mid-level as a destination'. The honest options for anyone currently in that band are two: become senior for real (operate what you built, carry decisions all the way to the end, be wrong in public), or become entry-level in something new (learn a stack you don't know, accept mentorship, be humble). The third option, staying mid-level by inertia, used to be viable. It is not anymore.

The [2025 DORA Report](https://cloud.google.com/resources/content/2025-dora-ai-assisted-software-development-report) is the clearest signal of this. AI adoption among developers reached 90%. AI is no longer a competitive edge for individuals - it is the floor. The report frames AI as a 'mirror and a multiplier': it amplifies team dysfunction as often as team capability. [Faros AI 2025 telemetry](https://www.faros.ai/blog/key-takeaways-from-the-dora-report-2025) across more than 10,000 developers found something even sharper. AI assistants drove a 21% increase in individual tasks completed and a 98% increase in pull requests merged, and organizational delivery throughput stayed flat. They call it the AI Productivity Paradox. I call it proof that volume was never the bottleneck.

## Mediocrity is a choice, not a level

Mid-level is not a number on your salary band. It is a state. You can have eight years of experience and be mid-level. You can have three and be senior-level. Time does not decide. What decides is what you do outside the hours your company pays you for.

Did you study something this week that nobody told you to study? Did you operate, in production, a system you built three years ago? Did you make a decision you could not push up the chain? If all three answers are no, you are mid-level, regardless of what your title says.

People who ask their company for 'a career plan' are asking the company to be their parent. The company is not a parent. The company is a bilateral contract. The contract says: you deliver value, you receive a salary. Career planning is not in the contract. It is in your calendar. Your career is yours. The first person responsible for it is you. If it is not you, you already chose mediocrity. You just have not noticed yet.

I have been wrong about this in public. In 2022, I started drafting a career plan for Buser. We had many teams, and the teams were big. I followed the market default: levels, bands, expectations per level, promotion criteria. The document was already in review with engineering leads and HR. I was being the kind of CTO who defends his chair, not the kind who defends what the company actually needs. I abandoned the draft. I restructured the teams - fewer people, different dynamics, no Greek pyramid. I built what the company needed, not what the org-chart template said I should build. ([ai-cost-discipline](https://avelino.run/ai-cost-discipline/))

I have preferred small, senior teams since 2011, when I started building companies. Not for labor cost. For velocity. People who join expecting a career plan are asking the wrong question. The right question is: what problem can I solve here that nobody else is solving? Whoever answers that becomes senior. Whoever keeps asking the first question eventually leaves.

## AI made the choice expensive

Before 2024, you could be mid-level for ten years without anyone noticing. There was enough work nobody wanted to do - glue code between services, maintenance tickets, 'alignment meetings', documentation nobody read. Mid-level engineers lived on this work. It paid the salary. It looked like contribution.

AI killed that work. Not gradually. Abruptly. In 2026, code is not the bottleneck, decision is. Meetings are not delivery, they are excuses to postpone decisions. The mid-level career was built on top of those two pillars. Both pillars are gone.

The choice that used to be invisible is now public. Either you can show what you studied last week without being asked, or you cannot. Either you operate the systems you built, or you avoid them. Either you carry a decision all the way through, or you find a way to defer it. AI did not change the standards. It made the standards measurable.

## The human part

This is not raw meritocracy. It is courage.

Senior-level engineers, the real ones, are those who had the courage to operate what they built, to be wrong in public, to own a decision until the end. Entry-level engineers who are good are those who have the courage to admit they do not know, and to learn in the dark. Mid-level is what happens when someone was afraid of both, and stayed in the middle.

Mediocrity is defensive, not lazy. It has more to do with fear than with talent. People in the middle are not less capable. They are more comfortable. The comfort is the trap.

Your career is not in your company's HR. It is in your calendar. Mid-level is not a position. It is a pause that became permanent. Stop asking for a career plan. Start writing your own, in code or in study or in operations, somewhere your manager did not assign.

Look at last week. How many hours did you spend studying something nobody told you to study? If the answer is zero, you are mid-level. Your title does not matter. AI already caught up to you. The only thing left is whether you will notice in time.
