---
date: "2026-04-12"
draft: false
title: "Contribute What You Use: Why Real Usage Makes Better Open Source Contributions"
tags: ["open-source", "open-source-contribution", "developer-mindset", "engineering", "ownership", "github"]
description: "The best open source contributor isn't the most technical — it's the one who actually uses the software. Use it first, then contribute what matters."
url: "/contribute-what-you-use"
---

There's a pattern I see constantly in open source contributions, and it costs everyone involved more than it should.

Someone finds a project. They like the idea. They read the README, skim the codebase, spot what looks like a gap, and open a pull request. The code is clean. The intention is good. The problem: they've never actually used the software.

The PR sits in review for a week. The maintainer tries to understand the motivation. Questions get asked. Answers are vague. The proposed solution works for a case the contributor imagined but doesn't account for how real users interact with the system. Eventually the PR gets closed - politely, if the maintainer has the energy for it.

This happens thousands of times a day across GitHub. And almost nobody talks about the real cost.

## The Hidden Cost of Drive-By Open Source PRs

The contributor spent maybe two hours on the PR. The maintainer spent two hours too - but those two hours looked completely different.

The contributor was building. The maintainer was decoding: reconstructing context that was never there, testing a hypothesis someone else formed without the data to form it, and then writing a careful explanation of why the solution solves the wrong problem. That's not code review. That's unpaid consulting for someone who didn't do the prerequisite work.

Multiply this by the volume of a popular project. I maintain [awesome-go](https://github.com/avelino/awesome-go), which has 168k+ stars and gets dozens of contributions every week. The PRs that take thirty seconds to evaluate are always from people who are using the library in production and encountered a real gap. The PRs that take thirty minutes are from people who had an idea.

The ratio of effort to signal is completely inverted between the two groups.

## Why Using the Software Beats Reading the Code

Here's the thing that doesn't get said enough: **you cannot reverse-engineer the feeling of hitting a real limitation**.

When you've actually used a piece of software - in anger, under deadline, with real data - the contribution that comes out of that experience carries information that no amount of code reading can replicate. The edge case you hit. The error message that told you nothing. The configuration option you needed that wasn't there. The workaround you built because the obvious path didn't work.

That's the signal. That's what makes a contribution valuable.

A contributor without usage is essentially writing fiction. They're imagining a problem, imagining a user, and imagining a solution. Sometimes they get it right by accident. But there's no reliable mechanism for being right, because the feedback loop that creates accuracy - actual use, actual failure, actual frustration - never ran.

## Issues Are Underrated Contributions

The cultural bias toward code as the only "real" contribution is one of the most damaging things about how GitHub shaped open source participation.

A well-written issue - specific reproduction steps, clear expected vs. actual behavior, minimal context that lets someone else reproduce the problem in five minutes - is worth more than most PRs. It contains verified information about a real failure mode. It doesn't require the maintainer to reconstruct what problem the contributor was trying to solve. It's honest about what it is: an observation from someone who was actually there.

The PRs I trust most often start as issues. Someone reports a bug, we discuss it, they understand the codebase enough to know where the fix should go, and then they write the code. That sequence is not an accident. The issue stage is where domain knowledge gets established before anyone starts writing code.

When you skip that stage and go straight to a PR, you're betting that your mental model of the system is accurate without ever having stress-tested it against reality.

## Your Reputation Is Not Infinite

There's a self-interested argument here that I think contributors underweight.

Maintainers remember. Not maliciously - they're not keeping a blacklist - but pattern recognition is unavoidable. Someone who opens PRs that consistently hit the mark gets the benefit of the doubt on the next one. Someone who repeatedly proposes solutions to problems they've never experienced trains the maintainer to spend more time on each PR, to ask more questions, to be slower.

This is the same principle behind [signing your commits](/the-code-is-yours): ownership isn't a formality. When your name is attached to a contribution, you're making a claim - that you understood the problem, that you tested the solution, that you stand behind the change. A PR from someone who never used the software is a signature on something they can't actually stand behind.

In a world where maintainers are already overwhelmed and triage time is the bottleneck, being the person whose PRs move fast is a real advantage. That reputation is built by being right, and being right comes from using the software.

The inverse is also true. A stream of well-intentioned but context-free contributions signals to the maintainer that engaging with your work is expensive. That's a hole that's hard to climb out of, and it's entirely avoidable.

## How to Contribute to Open Source the Right Way

Use the software. Actually use it - not a toy example, not a five-minute exploration, but in a context where you need it to work and feel it when it doesn't.

When you hit something broken or missing, write it down. Open an issue before you open a PR. Talk to the maintainer about whether the gap you found is intentional, whether there's a reason the obvious solution wasn't built, whether the problem you have is shared by others.

Then write the code - with that context, with that conversation in the background, with the confidence that you're solving something real.

That's not a slower path to contribution. It's the path that actually lands.

---

The projects that compound over time are built by people who use them. The maintenance burden that burns maintainers out is built by people who don't.

Which kind of contributor you are is a choice you make before you touch a single line of code.
