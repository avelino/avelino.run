---
date: "2026-06-28"
draft: false
title: "Reviewing is not understanding"
tags: ["ai", "engineering", "developer-mindset", "books"]
description: "The most repeated advice about AI code is to review it like a junior's PR. Naur explained in 1985 why that is not enough: reviewing gives you recognition, writing gives you the theory, and the bug lives in the gap."
url: "/reviewing-is-not-understanding"
---

The most repeated advice about AI-generated code is also the most wrong: treat every line like a PR from a junior you're mentoring. [I gave that advice myself](https://avelino.run/the-code-is-yours/). It sounds responsible. It sounds adult. And it ignores the one thing that matters: reviewing and writing do not produce the same knowledge.

You can review with all the discipline in the world and still freeze at 3am, unable to reproduce the bug. Not from laziness. From mechanics.

## Naur told us what a program is, in 1985

Peter Naur wrote *Programming as Theory Building*. The claim: the program is not the text. It's the theory in the head of whoever built it. The source code is residue.

For Naur, maintenance doesn't fail because documentation is bad. It fails because the theory died - the person who held the model of the program in their head left, and nobody recovers that model by reading the code. The text survives. The theory doesn't.

Read that again with AI generating half of what lands in the commit.

## Writing builds the theory. Reviewing doesn't.

When you write, the theory forms on its own, as a byproduct. Every line is a decision. Every decision discards three alternatives you never consciously register. By the time it compiles, the model of the program already lives in your head. You didn't ask for it. It came with the work.

When you review, you receive the residue finished. You read the text, check the shape, recognize the pattern. **That's recognition, not construction.** You finish the review knowing the code looks right. Not knowing why it's right, or what it discarded to get there.

These are two different kinds of knowledge. Recognition answers "does this look good?". Construction answers "why this way and not another?". The bug doesn't live in the first one. It lives in the second.

## The diligent dev freezes too

The "junior PR" advice assumes the problem is effort. Review carefully and you're covered. Comfortable lie.

You can read every line, think about the edge cases, approve with a clear conscience - and still not have built the theory. Because reading is not deciding. Approving the order of two operations is not the same as having chosen that order against the alternative that breaks. The diligent reviewer walks away with well-checked residue and zero theory.

Then the bug shows up. And the bug almost never lives in the "what" - what the code does, you understood during review. It lives in the "how": the edge nobody chose, the race between two points you approved at a glance, the case that only exists under real load. That's exactly the layer review doesn't exercise and writing exercised for free.

## The bill is the theory you never built

Reproducing a bug is reconstructing the state that broke. Reconstructing state needs the model of the program - the theory. If you never built the theory, you have nothing to rebuild it from. You stare at the code you approved and it stares back, correct and mute.

Before AI, writing handed you the theory whether you wanted it or not. The cost of producing understanding was baked into the cost of producing code. AI split the two. Now you can have the code without the theory, and nothing warns you it's missing - because it compiles, it passes, it looks done.

Treating AI like a junior doesn't fix this. A real junior builds their own theory and grows. AI builds no theory at all, and neither does yours, if all you do is review.

---

Reviewing was never understanding. It was a shortcut that worked because, before, the only way to reach the code already forced you to understand it.

AI removed the obligation. It kept the shortcut.

Next time you approve a PR generated in thirty seconds, ask one thing before the merge: if this breaks in three weeks, do I rebuild the state, or do I just recognize the lines?
