---
date: "2026-04-24"
draft: false
title: "The bug was coordination, not code"
tags: ["engineering", "product", "coordination", "postmortem", "anthropic"]
description: "Three teams made reasonable decisions. The product broke. Anthropic's postmortem is honest about the bugs - but silent about the organizational pattern that let all three ship at the same time."
url: "/the-bug-was-coordination-not-code"
---

Three teams made reasonable decisions. The product broke. That's not an engineering failure - it's what happens when you confuse process with overlap.

## The postmortem is honest about the wrong thing

Anthropic published a postmortem on the Claude Code regression. Worth reading in full. Three separate changes, different teams, different weeks, that together looked like model degradation:

Product switched default reasoning effort from `high` to `medium` - latency was killing the UX. Engineering shipped a caching optimization to reduce cost on session resume. Another team added a system prompt line to control verbosity on the new model.

Each decision was defensible in isolation. Together, they destroyed the experience for weeks.

The "going forward" section is where it gets interesting - and revealing. Broader evals. More ablations. Better tooling to audit prompt changes. A Code Review integration. All technical. All correct.

Zero mention of how three teams made simultaneous changes without visibility into cumulative effect. The postmortem diagnoses the bugs. It doesn't diagnose the coordination failure that allowed all three to ship at the same time.

## This is what scaling looks like without overlap

In 2022, the three people who made these decisions probably sat next to each other - or were the same person. The product instinct, the infrastructure constraint, and the model behavior all lived in one head. When something felt off, the feedback loop was a conversation, not a ticket.

By 2025, those decisions live in different orgs. Product owns effort defaults. Infrastructure owns caching strategy. Model behavior sits with whoever is prepping the harness for a new release. Each team is doing their job correctly. Nobody owns the intersection.

This isn't a critique of Anthropic specifically - they're building fast and this is what fast looks like at scale. It's a structural pattern every company hits when the team grows faster than the communication surface.

At Buser, I watch this happen at the product/engineering boundary constantly. A pricing change that made sense for conversion interacted with a backend timeout we'd adjusted for a different reason. Neither team knew about the other's change until drivers started reporting odd behavior on a specific flow. Both changes were right. The interaction sold tickets below the correct price long enough to impact GMV. It was invisible until it became a loss.

## Five signs you have the same problem

**1. Your postmortems identify root cause as technical, but the real question is "why did three things ship in the same window?"**

The Anthropic postmortem is precise about what broke. It's silent about the release coordination that let it happen. If your postmortems feel like this - thorough on mechanism, thin on process - you're diagnosing symptoms.

At Buser, we started requiring every postmortem to answer: "what other changes were live in the same 72-hour window, and did anyone verify the combination?" It's uncomfortable because the answer is usually "no."

**2. Your "going forward" is always more tooling**

More evals. Better monitoring. Automated checks. All correct and necessary. Also a way to avoid the conversation about who talks to whom before deploying. Tooling catches problems after they happen. Overlap prevents them.

**3. You can name the owner of each decision but not the owner of the intersection**

Effort level? Product. Cache optimization? Infrastructure. System prompt? Model team. Who owns "what happens when all three change in the same sprint"? If the answer is "we'd catch it in review", you don't have an owner, you have a hope.

At Buser, we made the CPO and CTO roles overlap deliberately - not by committee, but by having both perspectives at the same decision point. It doesn't scale forever, but it's honest about where the gap lives. I wrote more about this in [cto-job-changed-chair-didnt](/cto-job-changed-chair-didnt/).

**4. Your teams are aligned on goals but blind to each other's current work**

Goal alignment is necessary. It's not sufficient. A team can be perfectly aligned on "reduce latency" and ship something that interacts badly with another team's "reduce verbosity" work. Shared OKRs don't create visibility into what shipped this week.

**5. Your coordination happens after the fact**

The Anthropic bug was caught by user reports, not internal systems. That's not a monitoring failure - their monitoring was working. It's a signal that the coordination surface came after the release, not before. If your standard is "we'll see it in production", you're optimizing for fast detection instead of prevention.

## The part that actually matters

Publishing this postmortem was an institutional act of courage that's genuinely rare. AWS has had incidents with worse user impact and published nothing. Most big tech treats public postmortems as legal liability, not accountability practice.

That matters beyond the technical content. It sets a public standard that other CTOs now have to justify deviating from. When your team asks "why don't we do this?", the answer has to be better than "it's not our culture." Anthropic just made it someone else's culture.

But courage without correct diagnosis is just good PR. The postmortem is honest about three bugs. It's not honest about the organizational pattern that made all three possible at the same time.

Fixing evals catches the next bug. Fixing coordination prevents the category.

---

You don't have a bug problem. You have a problem of who owns the intersection between decisions each team makes alone, in the same week, without knowing what the other is doing.

Anthropic had the courage to publish the postmortem. They didn't have the courage to name that.

When was the last time someone at your company listed everything that changed in the same window before investigating what broke - not after? If the answer is "we do that in the postmortem", you already know where the problem is.
