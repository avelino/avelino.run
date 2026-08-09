---
date: "2026-08-09"
draft: false
title: "Taste is not a method"
tags: ["engineering", "design", "rust", "swift", "webkit", "browser", "zer0", "testing"]
description: "The design decisions in zer0 that only exist because something got measured: a logo rejected by a rasteriser, a luminance band where no ink is readable, a find bar that refuses to count, and a lock mechanism that admits what it cannot prove."
url: "/taste-is-not-a-method"
---

zer0 is a browser: WebKit engine, a core in Rust, a native Swift shell, MIT. The repository is new. The problem is not. In March I published [firefox-airtraffic](https://github.com/avelino/firefox-airtraffic), an extension that routes URLs into the Firefox container they belong to, because I wanted one specific thing my browser would not do for me. It solved that one thing and left the rest of the list exactly where it was. zer0 is the rest of the list, and its routing rules are the same idea ported into the core.

![README do zer0 no GitHub](/blog/taste-is-not-a-method-1-github-readme.png)

I am writing about it now, rather than when I started, because two things finally became true at the same time. The interface is one I actually want to open in the morning, and the codebase is organised enough that someone who is not me could read it and find the reasoning instead of just the result.

The source goes public in a few days. That is not the same as the browser being installable, and I would rather split those two now than let one word do work it cannot. You will be able to read it, build it and run it. You will not be able to download it. The bundle is ad-hoc signed, so it runs on the machine that built it and Gatekeeper refuses a copied one. That is a deliberate trade rather than a missing chore. Notarisation requires the hardened runtime, and the hardened runtime is precisely what makes dyld ignore the load command that lets an embedded WebKit be found. Shipping means either carrying an entitlement that re-enables every `DYLD_*` variable for the whole process, or rewriting install names across Apple-signed frameworks. Neither is free, and the choice is still open.

![zer0 com tabs verticais](/blog/taste-is-not-a-method-2-zer0-vertical-tabs.png)

The browser is where a person works and studies for most of the day. Open source has a habit of treating that surface as something to get to later, on the theory that the engine is the hard part and the chrome around it can be a settings dialog with eleven tabs. zer0 does not take that trade.

That sentence is free, though. Anybody can write it. So this post is only the decisions where something got measured and the measurement changed the drawing, plus what each one cost.

![Settings do zer0](/blog/taste-is-not-a-method-3-zer0-settings.png)

## A diagonal at 45 degrees is a road sign

The mark is a zero with a cut in it. The cut is subtractive and displaced, and it got there by elimination, not by preference.

A solid diagonal at 45 degrees, rasterised at 32 and 64 pixels, is the "no entry" pictogram. Not arguably. It is that sign. The defence I had planned, that our bar rises left to right like a solidus while the prohibition sign descends, does not survive contact with reality, because the pictogram is drawn both ways in the wild. So I tried a 3:4 variant, which escapes the prohibition reading and lands on the Danish Ø instead. A letter, not a digit.

**What decided this was a rasteriser, not an opinion.** Both candidates look fine as vectors on a grid at 100% zoom. They fail at the size the thing actually gets used at. The cut that shipped escapes both readings because there is no bar crossing the ring at all.

Then the same test found the next problem. At 32 rendered pixels and below, the canonical cut survives only as a disturbance in the antialiasing. Present, not legible, which is the worse of the two failures because it looks deliberate. I had assumed 24 before rendering it. It is 32.

So there is a second drawing. Same mark, different geometry: the ring goes from 32u to 44u, the counter stays large, and the mark itself is shortened from 80×104 to 72×94. Shortening it is the counterintuitive half, and it is just arithmetic. The grid scales by the tallest dimension, so height given up buys thickness everywhere else. The routing is on rendered pixels rather than points, so 16pt@2x and 32pt@1x get the hinted file while 32pt@2x gets the canonical one.

The cost is written down and it is real. Two files now have to agree forever, and anyone who reaches for the canonical SVG to make a 16px favicon gets a plain O and will not necessarily notice. No test guards any of it. The record carries the literal marker `none — debt`, which is the project's way of admitting a decision is undefended instead of pretending otherwise.

## The page has a colour and it will not tell you what it is

The chrome takes the page's own colour. The interesting part is not the idea, it is the fallback, because the obvious implementation does not work on the actual web.

Ask the DOM and you get nothing. `getComputedStyle` reports `rgba(0, 0, 0, 0)` for `documentElement` and for `body` on the great majority of documents. That is not an edge case to handle later, it is the common case. A tint built on DOM sampling alone would work only on the minority of sites that had already thought about it.

What rescues it is asking the engine what it actually painted: `WKWebView.underPageBackgroundColor`. The DOM rungs stay above it, because which declaration wins should be a rule the core owns and a test can name. But the engine's own answer is the reason the feature exists on a normal page instead of on a demo.

## The band where neither ink works

Getting a colour is half the problem. The other half is that some colours cannot carry text at all.

```rust
pub const MIN_INK_CONTRAST: f64 = 6.0;
pub const MIN_LUMINANCE_FOR_DARK_INK: f64 = MIN_INK_CONTRAST * 0.05 - 0.05;   // 0.25
pub const MAX_LUMINANCE_FOR_LIGHT_INK: f64 = 1.05 / MIN_INK_CONTRAST - 0.05;  // 0.125
```

Between 0.125 and 0.25 relative luminance, neither black nor white ink clears the margin. Pure red sits at 0.2126, in the middle of it. Against white it is 4.00:1. Against black it is 5.25:1. Both under the bar, which is why a red strip with white text looks fine in a mock and is unreadable on a laptop at an angle.

Three options: refuse the colour, ship unreadable text, or move the colour. The core moves it, to the nearer edge of the band, along lightness only. A 24 step binary search on lightness, hue and saturation untouched. `#ff0000` comes out `#ff3e3e` and is still plainly red. The test that locks it does not check the hex, it checks that the hue did not rotate: red stays above green, and green equals blue.

The cost, in the record's own words, is that a tint inside the unreadable band gets drawn a shade away from what the page asked for. A small number of sites, visible when it happens, and it is the price of the strip working on all the rest. The strip also has one text level where the rest of the shell has three, because a second level would need its own contrast guarantee and nobody has written one.

One thing worth admitting here. `#ff3e3e` is written in the README and in the record, and no test asserts it. It is correct, I recomputed it from the shipped algorithm. But it is prose, not a lock, and prose rots.

## The find bar will not tell you how many matches there are

`WKFindResult` reports `matchFound`. A boolean. No total, no index, no position. So the find bar has five states and no count, and the space where "3 of 17" would go stays empty.

This is the one decision in the whole set whose regression makes the interface look better. Adding a match count is the kind of change everybody praises in review. No test goes red. The screen looks more like Chrome. And the number is wrong on any page with an iframe.

It is also the decision with the weakest defence in the project. The status type is a private enum inside a view, nothing tests it, and the record says so: this is the easiest decision here to revert, and the one nobody would notice being reverted.

## The instrument lies too

This interface is verified by rendering real views offscreen and looking at the pixels. `NSHostingView` plus `cacheDisplay`, because `ImageRenderer` mangles materials. Most of the defects found that way were not catchable by an assertion, which is the entire reason the harness exists.

Then the harness lied. `cacheDisplay` photographs transform based animation as motionless. Five separate probes of a working animation, including a plain rectangle with no AppKit in it anywhere, all came back as "never moved". The replacement reads geometry instead of pixels, because what is being asserted is where the view is, not what it looks like.

The best defect the harness did find is my favourite one in the project, because nothing was broken. A `ScrollView` takes every point it is offered, so the command bar's list claimed 320 points whether it held two rows or eight. With a short result set, most of the panel was a slab of material with nothing in it. **The check had not failed. It had never been run on the input that fails.** Nobody had rendered the short list.

## The rule nobody can forget

Reduce Motion is not a rule people get told about here. It is a rule that does not compile if you break it.

```swift
fileprivate static let entrance = Animation.spring(response: 0.34, dampingFraction: 0.82)
fileprivate static let subtle = Animation.easeOut(duration: Duration.quick)
```

Both curves are `fileprivate`, so a call site cannot spell one. The only spellings that compile are the wrappers that read the accessibility environment first. The record puts it better than I can: the decision cannot be forgotten by omission, only reverted on purpose.

The cost is small and honest. With Reduce Motion on, the two curves collapse into the same curve, which reads as a loss of vocabulary. It is the correct loss.

## Every decision names the test that kills it

This is the part I would carry to another project unchanged. There are 44 decision records. Each one has five mandatory sections and a `**Lock:**` field naming the test that goes red if the decision is undone. `scripts/adr-check.sh` runs inside `check.sh` and resolves every lock: the file has to exist, the test name has to really be in it, and the test has to actually run. An `#[ignore]` or a `.disabled(...)` is refused, because a disabled test is a lock that opens itself.

Six of the 44 carry `none — debt`. That is a literal string the checker accepts and counts instead of failing on. Undefended decisions are allowed to exist. They just have to say so out loud, in the file, in the field where the test should be.

**And it does not work as well as that paragraph makes it sound.** The record for the mechanism says so about itself: it validates form, never substance. The checker confirms that a test named x exists in file y. It has no idea whether that test has anything to do with the decision, and it never will. A lock pointed at an unrelated passing test satisfies every rule in the script.

That gap has already cost this project real bugs, twice, in a row. The keymap lock proved a chord was present in the table while roughly 20 shortcuts did nothing, because nothing asked whether a keypress arrives. The replacement lock proved a keypress arrives, and then stayed green while every press acted on the wrong window.

The generalisation, once: **ask what question the test does not ask.** A green suite tells you the questions you wrote have the answers you expected. It says nothing about the questions you did not write, and that is where the bugs are.

There is a nastier failure the record names on itself. The gate call gets deleted from `check.sh` during a merge conflict. One line disappears, nothing ever fails again, and nothing in the repository detects it.

## What is not there

Chat is half built, and I would rather say it than let a screenshot imply otherwise. The core is real. Four provider wire formats are real (Anthropic messages, OpenAI chat, Gemini generateContent, Ollama chat, and the OpenAI shape covers a long tail of compatible endpoints). MCP is real, the settings panes are real. No view renders a conversation. ⌘E and the command bar's Ask row create a conversation you cannot see. Do not install this expecting to talk to a model.

None of this makes zer0 a good browser yet, and the two loosest threads are the ones I would pull on first if I were reading this instead of writing it. The lock mechanism proves a named test exists and never that it covers the decision, which is not a theoretical hole: it has already cost this project two bugs in a row, and the second arrived inside the fix for the first. And `#ff3e3e`, the number in this post that reads most like a result, is prose in a README with nothing underneath it. The record works. That is precisely where it does not reach yet.

The next one I want to write is already sitting in a doc comment. SwiftUI's `.regularMaterial` blurs the SwiftUI backdrop, and a `WKWebView` is not in that backdrop. It is an AppKit view composited by the window server underneath everything SwiftUI drew, so a material over a page has nothing to sample and falls back to its own flat tint. The command bar was asking for glass and getting a grey slab. Nothing was going to catch that: not a test, not a rendered frame, not a review. The framework did not fail, it did the documented thing to an input nobody had checked, and it did it silently. That class of bug deserves its own post.

When the source goes up, the part I would open first is not the code. It is `docs/adr`. Forty-four decision records, each naming what it cost and which test dies if you undo it, written while the choice was still live rather than reconstructed afterwards for an audience. Several admit they have no test at all and say so in the field where the test should be. You can disagree with any of them with the file open in front of you, which is the only kind of disagreement worth having.

---

**zer0** is open source: [github.com/thezer0com/zer0](https://github.com/thezer0com/zer0)
