---
date: "2026-10-03"
draft: false
title: "The pointer was right. The scope was wrong"
tags: ["open-source", "ai", "outl", "code-review", "debugging", "rust", "maintainers", "engineering"]
description: "Two bug reports reached outl in September with the diagnosis written by an LLM. Both named the right line. Both were wrong about how many places the bug lived. The model is good at where. Where else is still the maintainer's job, and on the second report I missed it in my own branch first."
url: "/the-pointer-was-right"
---

Two bug reports reached [outl](https://github.com/outlmd/outl) in September with the diagnosis already written. Both came from outside the project. Both had an LLM in the loop, and both said so.

The first one, [issue 319](https://github.com/outlmd/outl/issues/319), was about the TUI. Block properties rendered too far to the left. The reporter attached two screenshots and one sentence: "Thanks to ChatGPT/Codex, the problem is in `crates/outl-tui/src/view/outline.rs:207`".

The second one, [issue 332](https://github.com/outlmd/outl/issues/332), opened with a disclaimer. "This issue was generated with Claude Sonnet 5.5 and reviewed with light edits by me, a human." Then a root cause, two unit tests that reproduce it, a proposed fix and the suites it passed.

Both pointed at the right line. Both were wrong about how big the bug was.

## One line, three copies

In issue 319 the line was real. A bullet row in the TUI spends four cells between the indent guide and the text, two for the fold slot and two for the `- ` bullet. Property rows padded two. So `priority:: high` sat under the fold marker instead of under its block.

Patching line 207 would have closed the issue. The screenshot would have looked right.

The measurement lived in three places, and the three copies had drifted in three directions. The backlinks pane had its own copy and no tests at all. That was exactly the copy that had drifted furthest. It never drew the property glyph, so the same `remind::` showed a `⏰` in one pane and nothing in the other.

Writing the test for the fix found one more. The `⚡` marker measures two cells and the pad reserved one. Every continuation row of an `auto-run::` block had been a column short since the marker existed. Nobody ever reported it. Terminal alignment is the kind of bug people feel and don't file.

There was also a test that should have caught all of it. It asserted that a wrapped row `starts_with("  ")`. Any pad of two cells or more satisfies that, so it stayed green through the whole bug.

The fix became one module, `view::row_chrome`, which owns the fold slot, the marker, the pad and the property row ([PR 324](https://github.com/outlmd/outl/pull/324)). A patch on line 207 would have fixed one caller out of three.

## One gate, three owners

Issue 332 is the better report, and I want to be fair about that. It named the function, `sidecar_can_answer`, and explained why a fresh journal day looked like a file written before 0.11. Then it shipped a repro that fails next to a control that passes. That is rare from anybody, with or without a model.

I reproduced it on `main` in the first pass. The root cause was right.

Then I measured my own workspace. 2,874 sidecars, around 64k blocks. Exactly one page was stuck behind that gate, a page created from a wikilink, holding a single empty bullet. Zero genuine pre-0.11 files left. So every hit on that gate today is a false positive, and the affected pages go well beyond journal days. `outl init` creates pages in that shape. So does every wikilink page nobody ever filled.

And the fix the report proposed already existed. `reconcile.rs` asked the same second question, with the same helper, and got the right answer. The verdict had three owners. One of them was right and the other two had never heard about it.

I wrote in the issue that this was not a new policy, it was a policy applied in one of three places. That sentence was true. It was also the exact trap I walked into later that day.

## I did it in my own branch

I took the fix, moved the predicate next to the one it refines, and ran my review on the working tree before opening the PR. The review came back with three blockers.

All three were the same mistake. I fixed the gate and didn't go looking for the same badly asked question in the layers around it. One function counted an empty entry as a removed line, so `outl serve` held the page back on every sweep and reported a loss of content that can't happen. I reproduced it: `written: 0, withheld: 1`, the `.md` untouched. Another function counted empty lines as missing, which invalidated a claim I had just written in the CHANGELOG.

The repo already has an invariant for this. Number 9 in `CLAUDE.md`, "where the problem lives now". I didn't apply it to myself.

The fix is open as [PR 334](https://github.com/outlmd/outl/pull/334).

## Where versus where else

An LLM is very good at where. It reads the repo faster than I do, follows the call, lands on a line, and the line is usually right. Both reports this month landed on the right line.

The cost moved. Finding the line used to be the expensive part of a bug. Now it arrives for free, with a repro, and the expensive part is the question that comes after. Where else does the code ask this question? Which callers inherited the assumption without ever declaring it?

A report with a confident line number makes that question easier to skip. The issue looks done and the diff is small. The reporter's tests pass, because they test the place the reporter found.

I want more of these reports, not fewer. What I changed is a step in my own checklist. When a predicate changes, grep for every consumer of the same concept, not only the same symbol. A symbol search finds callers. A concept search finds the copy someone wrote by hand and never linked back.

Issue 332 taught me one more thing, and it's the part I would keep. The reporter found the root cause alone, in a codebase they had never touched, because invariant 8 was written down in dense prose in `CLAUDE.md`. That file was written for agents. It worked as onboarding for a stranger. I [wrote before](/reviewing-is-not-understanding) that approving a diff is not the same as holding its theory. Writing the theory down is how a stranger, and the model they brought, can hold some of it too.

---

The model found the line both times. Finding the other two was still my job.

On the second one, I missed them in my own branch first.
