---
date: "2026-10-03"
draft: false
title: "I was the bottleneck on awesome-go"
tags: ["open-source", "awesome-go", "golang", "maintainers", "hacktoberfest", "community"]
description: "awesome-go had around 200 open pull requests, a maintainers file that didn't match reality and a 2023 critique nobody answered. This week I went through all of it. What we got wrong, what changed, and where help is useful this Hacktoberfest."
url: "/i-was-the-bottleneck-on-awesome-go"
---

In December 2023 I closed an issue on awesome-go without writing a word.

[Issue 5136](https://github.com/avelino/awesome-go/issues/5136) came out of a test that flagged repositories with more than a year without updates. Nearly half the list showed up. Alex Bozhenko had spent his own time fixing that test. The day after I closed it, he opened a [discussion](https://github.com/avelino/awesome-go/discussions/5149): "It was disappointing to see that you closed the issue without saying a word." Then he asked what my plans for the repo were.

Other maintainers replied. One of them reopened the issue. I didn't answer for almost three years.

I answered today. He was right.

## What the repo looked like from outside

That issue wasn't a one-off. It was what the project looked like to anyone who needed a maintainer.

Around 200 pull requests were open. Some had been waiting since 2025, a few for years. Someone opens a PR, follows CONTRIBUTING, and waits. Nobody says yes. Nobody says no. After a while they stop checking. For a list that only exists because people send things to it, that's the worst answer you can give. A "no" at least comes with a reason.

The `MAINTAINERS` file listed six people who no longer had access to the repo. One of them said it in that same 2023 discussion: he was on the file and couldn't merge anything. Meanwhile four people who hadn't reviewed anything since 2022 still had write access. The file said one thing, the permissions said another, and neither described who was doing the work.

`SECURITY.md` told people to report vulnerabilities in a public issue. People did exactly what it said. We have eight security reports sitting in the open.

And `main` was red. The tests broke and stayed broken, so every new PR inherited a failure that wasn't its fault. CONTRIBUTING also still asked for a Go Report Card link after the service was discontinued in July. We were asking contributors for something that no longer existed.

None of this is a hard technical problem. It's a maintainer not showing up, and that maintainer was mostly me.

The worst part is that I wrote about it while it was happening. In 2024 I said [reviewing PRs and validating additions by hand is tedious](/the-challenge-of-maintaining-open-source-projects-why-your-project-might-not-be-used-in-the-future/). It is. That's not a reason to leave them without an answer. In 2025 I published a post using awesome-go as an example of [communication-driven maintenance](/communication-the-hidden-backbone-of-successful-open-source-rojects/). Alex's discussion was still sitting there with no reply from me.

## What changed this week

I started with the PR backlog. All of it, one by one.

14 got merged, some of them waiting since 2025. 108 got closed, each with a comment saying why. 8 need a small change, and their authors got a note saying exactly which. About 20 from the old backlog still need a real decision, and I'd rather take another week than guess.

`main` is green again ([PR 6728](https://github.com/avelino/awesome-go/pull/6728)), and tests now have to pass before any merge. It can't break quietly again.

The Go Report Card requirement is gone from the docs ([PR 6730](https://github.com/avelino/awesome-go/pull/6730)) and from the quality bot ([PR 6731](https://github.com/avelino/awesome-go/pull/6731)).

`MAINTAINERS` now matches who has access ([PR 6732](https://github.com/avelino/awesome-go/pull/6732)). People who passed through the project moved to a thank-you section, and inactive accounts lost write access. That part felt strange. Some of those names helped build the list when it had a few thousand stars. Thanking them in the file is honest. Keeping their access "just in case" wasn't.

Then the issues and discussions. 66 of them had no reply from a maintainer, 37 issues and 29 discussions, including the one from 2023. All 66 got an answer. 57 got closed as resolved, duplicate, out of scope or spam. 9 stay open because they're real work, and most of them are in the list at the end of this post. A few threads had turned into spam, personal attacks or people exposing personal data, so those got locked. From now on issues and discussions get a weekly pass, so the pile doesn't grow back.

## Every PR gets an answer

A PR that sits for a year with no reply is still a decision. Nobody wrote it down, that's all.

So the rule now is simple. Every PR gets an answer: merge, ask for a change, or close with a reason. A closed PR with a clear reason respects the author's time more than an open one nobody looks at.

That also means saying no more often. A list that accepts everything stops being curated, and curation is the only reason this list is useful.

## Where you can help

It's Hacktoberfest, and awesome-go gets a wave of PRs every October. Most of them add a new project. That's fine, but it's not what the list needs most right now. I wrote in April that the PRs that take thirty seconds to evaluate come from people who [actually use the library](/contribute-what-you-use/). The same goes for removals. If you depend on something in the list and know it's dead, you're the best person to send that PR.

- Remove dead projects. The list still has plenty. A removal PR with a short note on why is the most useful thing you can send ([how to remove an item](https://github.com/avelino/awesome-go/blob/main/CONTRIBUTING.md#how-to-remove-an-item-from-the-list)).
- Review other people's PRs. A comment checking a submission against CONTRIBUTING saves a maintainer the first pass.
- Move the site generator to `html/template` ([issue 6672](https://github.com/avelino/awesome-go/issues/6672)). Today README content goes through `text/template` without escaping.
- Bump goldmark ([issue 6675](https://github.com/avelino/awesome-go/issues/6675)). It's a good first issue.
- Fix the coverage link detection in the quality bot ([issue 6643](https://github.com/avelino/awesome-go/issues/6643)).

On our side, the next step is turning on private vulnerability reporting and fixing `SECURITY.md`, so the next report doesn't land in public.

---

I wrote [in 2018](/keeping-open-source-projects-awesome-go/) that once the fun of starting a project passes, what's left is the responsibility of keeping it going. I believed it. Then I spent a good part of the last few years not doing it.

awesome-go has more than 186,000 stars today. When we passed 75,000 I [wrote a post](/we-are-more-than-75000-people-awesome-go/) saying I never imagined it would reach that many people. Behind that number are the people who sent PRs, reviewed submissions, reported dead links and kept using the list, including the years I wasn't paying enough attention. Thank you for sticking around.

If you opened a PR on awesome-go and never heard back, I'm sorry. Open it again. This time somebody answers.
