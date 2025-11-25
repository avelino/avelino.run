---
date: "2025-11-25"
draft: false
title: "Failing on Purpose: Building a Postmortem Culture That Cuts Across the Entire Company"
tags: ["postmortem", "blameless culture", "leadership", "organizational culture", "resilience", "learning from failure", "incident management", "SRE", "complex systems", "team building"]
description: "Exploring how to build a company-wide postmortem culture that goes beyond engineering, turning every incident into a learning opportunity instead of a blame game, inspired by Dave Zwieback's Beyond Blame"
url: "/failing-on-purpose-building-postmortem-culture-across-company"
img: "/blog/failing-on-purpose-building-postmortem-culture-across-company.png"
---

At some point in my life as a CTO (technology leader) I noticed something uncomfortable: we talked a lot about "learning from mistakes", but in practice, what happened after an incident looked a lot more like "put out the fire + find who's to blame + move on" than actual learning.

That's when I stumbled on [*Beyond Blame – Learning from Failure and Success*](https://www.amazon.com/Beyond-Blame-Learning-Failure-Success-ebook/dp/B016CJ5HUA/ref=tmm_kin_swatch_0), by Dave Zwieback, and two hard truths finally clicked:

1. In complex systems, **failure is not an exception, it's an operating mode**;
2. And if the company's first reaction is to point fingers, you kill any chance of becoming more resilient.

Zwieback writes that failure is inevitable and that post-incident analysis, conducted openly and without blame, is the best way to learn from outages and near-misses. When I read that, it matched everything I'd already seen in production: it's not about stopping the world from breaking; it's about how you react when it inevitably does.

There's one important detail though: **if this learning only happens inside engineering, it's not culture — it's a silo**.

What I want to share here is exactly that shift: how I went from a postmortem practice restricted to tech to a learning culture that involves product, operations, support, finance, sales and whoever else is affected. And how the ideas in [*Beyond Blame – Learning from Failure and Success*](https://www.amazon.com/Beyond-Blame-Learning-Failure-Success-ebook/dp/B016CJ5HUA/ref=tmm_kin_swatch_0) helped me structure this in a more honest and less "slideware" way.

![Failing on Purpose: Building a Postmortem Culture That Cuts Across the Entire Company](/blog/failing-on-purpose-building-postmortem-culture-across-company.png)

## When "human error" becomes an excuse to stop thinking

Before this book, I'd already seen the classic pattern: incident happens, a group gathers, someone raises a hand and says something like "it was human error". Investigation over. Everyone goes back to their desk relieved because there's now a "root cause" to document.

Zwieback tears this down pretty precisely: he insists that **"human error is a symptom — never the cause — of deeper problems in the system"**.

That idea sounds subtle, but it changes everything.

When you accept that "nobody wakes up in the morning wanting to do a bad job" and that the person made that decision because, in their head, it made sense given the information they had at that moment, the focus shifts from the person's morality to the system's design:

- what kind of deadline pressure existed there?
- what information wasn't visible?
- which alarm didn't fire?
- what process quietly pushed the team toward the shortcut?

The book also grounds the discussion in a complex-systems view: you can't use a linear cause-and-effect model in environments where everything is moving all the time. Zwieback pulls from people like Richard Cook (*How Complex Systems Fail*), Erik Hollnagel (Safety-II) and Sidney Dekker (human error) to show that **we learn very little because we try to cram complex stories into overly simple narratives**.

Once that sunk in, I became that annoying person who says "I don't accept 'human error' as a root cause".

## The reality check: when only engineering learns, nobody learns

In the beginning, our postmortems looked very familiar: engineers, SRE/infra, maybe a PM. We'd open logs, build a timeline, discuss technical decisions, propose improvements. For the people in the room, it was useful. For the rest of the company, nothing changed.

But the real impact of incidents is never purely technical. It shows up in:

- support having to improvise explanations with zero context,
- operations reworking processes based on intuition,
- product getting pressured without understanding the root cause,
- finance seeing rework costs materialize out of nowhere,
- sales dealing with angry customers without a clear story.

In other words: **engineering was learning, everyone else was just getting punched in the face**.

At the time, I sold myself the narrative of "at least we're doing postmortems". After reading [*Beyond Blame – Learning from Failure and Success*](https://www.amazon.com/Beyond-Blame-Learning-Failure-Success-ebook/dp/B016CJ5HUA/ref=tmm_kin_swatch_0) and connecting it with everything I'd seen in SRE, the penny dropped: the way we were doing it was better than nothing, but way below the potential. The culture was still "IT fixes, everyone else hopes for the best".

A real learning culture only starts when the incident becomes a **company-level event**, not just a technical one.

## Flipping the script: from team postmortem to company postmortem

The change wasn't magical. It was slow, awkward and full of friction. But a few principles helped a lot.

The first was a conscious decision that **postmortems would be blame-free in practice, not just in slides**. That meant that I, as a leader, started opening those conversations by owning my own judgment errors: "I approved this path", "I let this risk pass", "I prioritized X over Y and that contributed". When leadership assumes systemic responsibility, the rest of the team understands this isn't a trial of individuals, it's a review of the system.

The second was bringing other departments to the table. Not as "guests", but as essential parts of the story. When you put someone from support, someone from operations, someone from product and sometimes even someone from finance in the same room, the timeline stops being just "at 10:32 the pod restarted" and becomes "at 10:35 the call center started getting hammered", "at 10:40 ops began manually reshuffling schedules", "at 10:55 sales received a furious voice message from a key customer". The narrative turns uncomfortable, human and complete.

The third was letting go of the temptation to tell a "single clean story". [*Beyond Blame – Learning from Failure and Success*](https://www.amazon.com/Beyond-Blame-Learning-Failure-Success-ebook/dp/B016CJ5HUA/ref=tmm_kin_swatch_0) spends a lot of time on how our urge to "close the loop" makes us invent tidy stories with a villain and a single trigger, and how that sabotages learning. In our process, I started insisting on multiple perspectives: "how did you see this from your side?", "what else was happening in your area at the time?", "what information did you have when you made that call?". That plurality is what surfaces the real conditions.

Once all of that started to take root, the atmosphere shifted. The default emotion stopped being "who screwed up?" and became "what in our system makes this kind of failure likely?". That's a completely different level of discussion.

## Mental tools I carry into every postmortem

One of the most useful things about [*Beyond Blame – Learning from Failure and Success*](https://www.amazon.com/Beyond-Blame-Learning-Failure-Success-ebook/dp/B016CJ5HUA/ref=tmm_kin_swatch_0) is how it combines complexity theory, cognitive psychology and engineering practice into a set of lenses you can reuse all the time. A few of them stuck with me.

The first is the idea that **the so-called "root cause" is almost never a single thing**. In discussions inspired by the book, some people like to provoke by saying "the only root cause is change" — everything else is a stack of conditions that build up until something tips over. Once you internalize that, you stop looking for a magic button or a scapegoat and instead map layers of context: code changes, team changes, process changes, business pressure.

The second is paying attention to **hindsight bias**. After we know the outcome, everything looks obvious. "Clearly we shouldn't have deployed that day", "it was obvious that alarm was misconfigured". At the time, it wasn't obvious. The book connects this with how our brain reconstructs stories after the fact. Today, during a postmortem, I stop conversations that sound like "how could nobody see this?" and redirect them to "what signals existed at the time?" and "why, given those signals, did that decision seem reasonable?".

The third is to look not only at what went wrong, but at **what usually goes right**. Hollnagel calls this Safety-II: instead of only studying accidents, you also study why on most days nothing blows up. Once we brought that into our reviews, we started explicitly recording: "what prevented this incident from being worse?", "what quick decision helped reduce impact?". That shifts the tone of the conversation, protects team morale and, more importantly, gives you material to strengthen practices that already work.

Taken together, these lenses move the discussion away from "this person made a mistake" to "our system routinely produces this kind of decision; what can we change to make better decisions easier?".

## When the culture actually sticks

After you practice this kind of review consistently for a while, you start seeing signs that the culture has flipped.

People bring small incidents up for review without being asked. Non-technical teams start asking to join postmortems for incidents that affected their KPIs. PMs, ops and support begin speaking the same language around risk, resilience, SLOs. And, maybe most importantly: **you see people saying "I messed up here" without fear, because they trust that the error will be turned into learning, not punishment**.

On the more "hard" side, numbers begin to move: fewer repeats of the same incident pattern, shorter time to detection, less cross-team noise during incident response, fewer panicked decisions made in the dark. It's not magic; it's deliberate practice of learning from failure.

There's one detail here that I consider central as a leader: every time the company takes an incident seriously, runs a deep review, communicates the lessons learned and shows clearly what changed because of it, you're sending a very strong cultural signal: **"we don't waste pain here"**.

## Failing with purpose

[*Beyond Blame – Learning from Failure and Success*](https://www.amazon.com/Beyond-Blame-Learning-Failure-Success-ebook/dp/B016CJ5HUA/ref=tmm_kin_swatch_0) is marketed as a book about postmortems and outages, but to me it's really a book about how to treat adults in complex systems. It starts from the premise that every system will fail and that the only way to survive is to **turn each failure into a learning lab**, not a blame theatre.

In my experience, the magic happens when you can take that beyond engineering. When sales, product, operations, support and finance all see value in reviewing real problems together, you no longer have "a culture in IT"; you have "a culture in the company".

You are going to fail. We all are.
The choice is whether you're going to fail chaotically, repeating the same patterns, or **fail on purpose**, turning each incident into a chance to strengthen the organization's collective muscle.

If you want to go deeper into this, read [*Beyond Blame – Learning from Failure and Success*](https://www.amazon.com/Beyond-Blame-Learning-Failure-Success-ebook/dp/B016CJ5HUA/ref=tmm_kin_swatch_0), by Dave Zwieback. It's short, direct and fits uncomfortably well with the reality of anyone living in production, under pressure, with real people on the other side.

The rest is practice: opening your calendar, opening your data and, most of all, letting go of the need to always be "right" so you can finally start to learn.
