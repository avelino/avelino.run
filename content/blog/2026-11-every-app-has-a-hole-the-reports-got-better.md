---
date: "2026-11-17"
draft: false
title: "Every app has a hole. The reports got better."
tags: ["security,open-source,ai,bug-bounty,engineering"]
description: "Every non-trivial system has bugs. AI made them cheaper to find, and the writeups landing in a CTO inbox are now good enough that you have to look."
url: "/every-app-has-a-hole-the-reports-got-better"
---

Every non-trivial system has holes. I have been a CTO long enough, and I have maintained open source long enough, to treat that as a starting point, not a scandal. The work is to assume they are there, give people a way to tell you, and fix what you can reproduce.

What changed is the cost. A capable student with a model can turn ordinary recon into a writeup you can act on in an afternoon. The reports landing in a CTO inbox look different now. That is good for users. It is also more work for the person who has to read them.

## The writeup got sharper

A few years ago a lot of inbound reports were a screenshot, a vague title, and a request to get on a call. Some were real. Many were not. You spent the first hour deciding whether there was anything to decide.

The shape I see now is more consistent. A named finding. A short summary. Numbered steps. A `curl` you can paste, with the response the reporter expects. Screenshots tied to each step, not a random dump. A remediation list written like an engineer, not like a scanner. And, when the report is honest, a line about what the issue does not reach.

I read that line first, after the summary. Inflated impact is easy to write. A precise limit is harder, and it is the fastest way to earn a reading.

I also see the template. The same headings, the same cadence, again and again. I do not need the reporter to confess which model they used. The prose often gives it away, and I do not care. I care whether I can reproduce it before lunch.

[Daniel Stenberg](https://daniel.haxx.se/), who maintains curl, wrote this shift in public. In 2025 the project was drowning in AI slop. The share of submissions that became confirmed vulnerabilities fell from something above 15% to below 5%. In January 2026 they [ended the monetary bounty](https://daniel.haxx.se/blog/2026/01/26/the-end-of-the-curl-bug-bounty/). By April he was describing a different problem. The slop had receded. Volume was higher than ever. The confirmation rate was back around 15% to 16%. Almost every report used AI to some degree. He called it [high-quality chaos](https://daniel.haxx.se/blog/2026/04/22/high-quality-chaos/).

In October he [went further](https://daniel.haxx.se/blog/2026/10/22/ignore-the-slop/). In the months before that post, hundreds of reports had arrived, and every single one had AI in it. The made-up reports were mostly gone. The new pain was high volume and high quality. The models still talk too much, and they are still weak at drawing the line between a bug, a vulnerability, and a severity score. They are much better at proofs of concept. That used to be the hard part of the reporter's job.

I have been on both sides of that queue. A wrong report wastes an hour. A correct, long report still costs an afternoon, and you cannot skip it. You do not make users safer by ignoring a real hole because a model helped write the report.

## Finding it got cheap

Better writeups are the visible part. Discovery got cheaper too.

In October 2025, [HackerOne's ninth Hacker-Powered Security Report](https://www.hackerone.com/press-release/hackerone-report-finds-210-spike-ai-vulnerability-reports-amid-rise-ai-autonomy) said 70% of surveyed researchers already used AI in their workflow. Autonomous agents, the "hackbots", submitted more than 560 valid reports. A [later writeup on that same report](https://www.hackerone.com/blog/2025-hpsr-researcher-signals) said valid AI findings were up 210% year over year. It also said 78% of valid hackbot findings were XSS. The bots are good at known patterns. They clear the baseline. The same writeup is blunt about fully generated text. Reports written entirely by AI are often polished and technically shallow. Triage teams spot them quickly.

[Bugcrowd's 2026 survey](https://www.bugcrowd.com/press-release/bugcrowd-report-unveils-the-era-of-human-augmented-intelligence-as-ai-adoption-climbs-to-82/), with more than 2,000 participants, put AI use among hackers at 82%, up from 64% in 2023. They use it to automate work, learn faster, and analyze data. One number from that report should bother any team that still hides the disclosure address. 65% of hackers have chosen not to disclose a vulnerability because the reporting path was unclear.

You do not have to take my inbox as evidence. In June 2025, [XBOW](https://xbow.com/blog/top-1-how-xbow-did-it), an autonomous penetration tester, reached the top of HackerOne's US leaderboard. It said it had submitted about 1,060 vulnerabilities, with a human review before each submission. In August, [Google said](https://techcrunch.com/2025/08/04/google-says-its-ai-based-bug-hunter-found-20-security-vulnerabilities/) its Big Sleep agent, built by DeepMind and Project Zero, had found and reproduced 20 vulnerabilities in open source software. A human expert still reviewed the reports before they went out. The agent did the finding and the reproduction.

I maintain [awesome-go](https://github.com/avelino/awesome-go). A list like that is a public door. People find you. They write. They expect an answer. On [pREST](https://github.com/prest/prest), the door is the code itself.

In September 2025 I published [GHSA-p46v-f2x8-qp98](https://github.com/prest/prest/security/advisories/GHSA-p46v-f2x8-qp98), also tracked as [CVE-2025-58450](https://github.com/prest/prest/security/advisories/GHSA-p46v-f2x8-qp98). Doyensec had done an independent review and sent a complete report. I shipped [v2.0.0-rc3](https://github.com/prest/prest/releases/tag/v2.0.0-rc3) after the advisory went out, and more fixes when a follow-up showed the first patch was still incomplete. I am not going to walk through the bug here. The useful part, for this argument, is already in the advisory. An earlier report, [GHSA-wm25-j4gw-6vr3](https://github.com/prest/prest/security/advisories/GHSA-wm25-j4gw-6vr3), had pointed at the same class of issue in 2024. The submitter did not make the impact clear, and the issue sat. That was on me as much as on the writeup. A complete report is harder to defer.

## The hard part moved

Most of this volume is still known patterns, the kind of thing a bot can match because it has seen the shape before. None of that is a new science. It is the work we like to believe we already finished.

What moved is the queue. Stenberg heard the same story from a long list of other open source projects. The attacker has the same tools, and does not file a report. The only advantage a product team or a maintainer still has is intake. You need a visible door, someone who can reproduce, and the habit of treating a good report as work.

I do not read a well-written report as a sign that a team was careless. I read it as the system working, if you built a way for it to arrive. Mature teams assume bugs. They decide in advance what they will reward, and how fast a real one should move. I reward valid, reproduced issues, not attempts.

If you are a researcher, I want the human sentence first. Then the full writeup.

- Three lines on what is broken, why it matters, and what it does not do.
\- A command I can run, and the result I should see.
\- Screenshots tied to the steps, and a fix I can consider.
\- The details in the email. Not on a call, and not held for a meeting.

A severity score helps less than an honest scope line.

If you run a team, the volume is not going back down.

- Publish a disclosure address, and actually read it.
\- Decide who triages, and reward what you can reproduce.
\- Keep the thank-you short and the fix shorter.

The holes were always there. The new part is that the report is good enough that you have to look.
