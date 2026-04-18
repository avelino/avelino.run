---
date: "2026-04-18"
draft: false
title: "AI tools have a cost problem. But it's not the tools"
tags: ["ai", "engineering-management", "cto", "cost-discipline", "dora"]
description: "Uber burned through its annual AI budget in four months. The lesson isn't that AI is expensive - it's that ungoverned adoption at scale is. A bootstrap-trained CTO's view on measuring return, not usage."
url: "/ai-cost-discipline"
---

Uber's CTO [burned through the company's annual AI budget in four months](https://www.benzinga.com/markets/tech/26/04/51828848/ubers-anthropic-ai-push-hits-wall-cto-says-budget-struggles-despite-spend).

5,000 engineers. Claude Code. An internal leaderboard ranking who uses it the most. Based on what's been reported: no cap, no cost governance. I don't know exactly how it works from the inside - all I have is the public read of the case. And that read tells me a lot about a pattern I see repeating at companies of every size.

I wrote a [short post about it on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7450856337414127616/) and it hit a nerve. The comments turned into a real conversation - engineers, directors, CTOs sharing how they're dealing with the same pressure. That told me the surface take wasn't enough. So here's the longer version.

## I never had a safety net

I didn't come up managing technology budgets with VC money behind me. Everything I built before Buser was bootstrapped. When I made a bad infrastructure decision, it came out of my pocket. Literally.

That shapes you. Not in a conservative "never spend money" way - in a conscious way. You learn to separate two very different modes:

**Test mode**: you're buying information. Cost is part of the experiment. Don't optimize, learn.

**Scale mode**: you're committing. Every dollar needs a return. Leaving the tap open isn't boldness, it's negligence.

Most companies I see today are running scale budgets with test mindset. In my read of the case, that's what happened at Uber.

## Usage is not a metric

Based on what's been reported, Uber built a leaderboard. Engineers competing on who uses AI the most.

In my read, this isn't a productivity system. It's a cost acceleration system dressed up as culture.

You can burn thousands of dollars in tokens without shipping anything meaningful. I've seen it. Long context loops, AI generating code nobody reviews, prompts that go 40 messages deep to produce something that would take 10 minutes by hand. Token consumption with zero correlation to output.

Usage tells you the tool is being used. It tells you nothing about whether it should be.

## What I use to decide

I'm not going to pretend we have this perfectly figured out at Buser. But the frame I work from is anchored on DORA metrics, which the industry has consolidated as the reference for engineering health for years. The logic doesn't change with AI in the mix - AI is just another variable pushing or pulling those numbers.

**Deployment frequency** - how often code reaches production. AI moves this number legitimately when it cuts time on repetitive code, boilerplate, tests. It moves it falsely when it generates volume of code nobody reviews properly and ends up sitting in PR. The number alone doesn't tell you which one is happening - you need to cross-reference with lead time.

**Lead time for changes** - PR open to production. This is the metric that exposes badly used AI the most. If frequency went up but lead time also went up, you're generating more open work, not more delivery. The code leaves the dev faster, but sits in review longer because nobody trusts it.

**Change failure rate** - how many deploys roll back. Productivity that generates rework is negative productivity. AI has a specific pattern here: when misused, it produces code that passes the immediate test but fails on an edge case a human would catch. If this metric goes up, your real cost is double what the invoice shows, because you pay twice - the generation and the fix.

**Time to restore** - when something breaks, how long it takes to recover. AI is a double-edged blade here. It helps when it accelerates diagnosis, reads logs, suggests hypotheses. It hurts when the dev doesn't understand the code AI generated and gets stuck trying to debug it. The number reveals which version of your team you're building: people using AI to amplify capacity, or people who depend on AI and stall without it.

Cross these four with cost per shipped feature - not per dev, not per hour, per delivery - and you start separating signal from noise. A dev burning 10x more tokens to ship the same as the rest of the team isn't being more productive, they're being more expensive.

### Where this frame doesn't reach

DORA is the floor. Not the ceiling. There are decisions you make looking at numbers outside those four metrics, and if you stay hostage to them, you miss good bets.

**Case 1: rewriting an internal piece of software we'd been dragging since 2023.**

Software written in a language outside our day-to-day stack. Every engineer who needed to touch it suffered. Every maintenance request turned into a project. We lived with it because rewriting always felt too expensive.

With AI, transcribing that code to our stack became a simple task. I don't have a clear financial KPI for that rewrite. But maintenance time dropped dramatically, and any dev on the team can now work on it - no dependency on a specific platform profile.

The return doesn't show up in DORA. It shows up in operational autonomy. And operational autonomy is strong currency when you're running a lean team.

**Case 2: seat selection.**

Looking at competitors selling traditional intercity bus tickets, everyone had seat selection. We, working in collaborative charter bus, never mapped that on day zero. We simply didn't think of it. Product fell behind on that specific point.

Implementing seat selection isn't just engineering - there's a business layer, operations adapting, pricing policy. With AI, we implemented it faster and iterated in parallel while the business adapted to the new reality. It turned into a significant extra revenue stream.

Here the return is direct and financial. You can measure it. But the decision to use AI to accelerate that delivery wasn't made looking at DORA. It was made looking at a competitive gap and a revenue opportunity.

DORA protects you from waste in the day-to-day. It doesn't tell you where to bet. For the bet itself, you need to know what the business needs and where AI cuts a corner. That's judgment, not metric.

## The distinction that matters

Testing a new tool, exploring what AI agents can actually do in your stack, running experiments - all of that has a cost, and that's fine. It's the cost of learning. Don't optimize prematurely.

But the moment you move from experiment to standard workflow, the rules change. You need to know what you're buying. Not "engineers feel more productive" - that's self-perception, not data. What moved in the four metrics? What's the cost per shipped feature compared to before?

If you can't answer that, you don't have a productivity investment. You have an expensive feeling.

### The trigger I use to switch modes

The million-dollar question is: when exactly do you decide you've left the test and entered scale?

The criterion I use is simple: **usage volume against financial impact**.

In test mode, I don't look at cost. If three, five, ten engineers are exploring a tool, breaking things, learning where AI helps and where it gets in the way - the absolute cost is irrelevant. What I want is signal. I want to find out if there's real return there or if it's just enthusiasm.

The switch comes when usage volume starts rising organically - more people using it, heavier use, becomes part of the natural delivery flow. At that moment, before rolling out to the whole team, I stop and ask: is that volume generating measurable financial impact? Whether in new revenue, recovered margin, capacity I didn't need to hire, rework that stopped happening.

If the answer is yes, rollout with cost governance from day one. Cap per dev, usage alerts, weekly review for the first 60 days.

If the answer is no, back to test mode. No expansion. Because expanding use without proven impact is exactly what happened in the story that opened this post.

## Uber can absorb it. You probably can't

$3.4 billion R&D budget. They'll replan and move on.

Most companies don't have that margin. And the pattern will repeat everywhere if the lesson people take from this story is "AI tools are expensive" instead of "ungoverned adoption at scale is expensive."

In my read, the tool isn't the problem. The leaderboard was the problem.

Good tools with bad governance are just more expensive mistakes.

---

*This post came out of a LinkedIn conversation that started [here](https://www.linkedin.com/feed/update/urn:li:activity:7450856337414127616/). Worth reading the comments - the Uber director who jumped in asked exactly the right questions.*
