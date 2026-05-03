---
date: "2026-05-03"
draft: false
title: "Technical founders misread adoption - Rogers explained it in 1962 and I ignored it on Pix"
tags: ["founders", "product", "adoption", "pix", "dhm", "rogers"]
description: "I bet against Pix in 2021 because I read adoption with the wrong lens. Rogers had the manual on a shelf for sixty years. DHM would have caught it in any roadmap review. Both ignored, both screaming."
url: "/technical-founders-misread-adoption-rogers-pix"
---

Early 2021. My co-founder walks in: "let's add Pix to checkout."

My answer, word for word: "let the big players go first and screw it up. If it works for them, we implement."

A few months later, there I was, implementing Pix at checkout. Not because I changed my mind - because the market had already decided without me.

## The technical founder's bias

There's a bias technical founders carry that nobody talks about: we think we can predict adoption because we understand the technology. It's the opposite. When you understand infrastructure, you stare at architecture, latency, edge cases, failure modes. Adoption doesn't live there. Adoption lives in the gap between what people do today and what they'd rather do tomorrow, and that gap is human, not technical.

This bias has a specific origin. Technical founders spend years being rewarded for skepticism. Skepticism keeps you from buying a vendor's promise, falling for hype around a new framework, burning a sprint on an idea that won't scale. It's a well-trained professional muscle. The problem is that this muscle, applied outside the domain it was trained in, becomes a liability. Skepticism about mass technology adoption is exactly that: the right tool in the wrong context. The question "will this scale technically?" and the question "will this be adopted?" look like sisters. They're not. The first is about technology, the second is about people. Technical founders answer both with the same lens and systematically miss the second one.

## Rogers and the predictability of the skeptic

In 1962, Everett Rogers published [Diffusion of Innovations](https://www.amazon.com/Diffusion-Innovations-5th-Everett-Rogers/dp/0743222091). It's not a technology book, it's a rural sociology book - Rogers was studying why Iowa farmers adopted or rejected hybrid seeds. The theory that came out of it explains TV, the internet, the smartphone, Pix. And it was explaining Pix in real time, if I had bothered to look.

Rogers split adopters into five categories: innovators, early adopters, early majority, late majority, laggards. Each category has its own psychological profile - it's not just chronological order, it's a type of person. Innovators take risks for fun. Early adopters lead opinion. Early majority waits for social proof. Late majority waits for indisputable economic proof. Laggards only move when there's no alternative left.

The detail that hurts: late majority isn't uninformed. Rogers describes this profile as skeptical, cautious, **economically rational on the surface**. They watch the technology prove its value with others and only then move - and they rationalize this as prudence. "Let the big players go first" is literally the line Rogers attributes to late majority in 1962. I wasn't wrong by accident. I was an archetype.

The part I hadn't understood: late majority **thinks it's being strategic**. The rationalization feels solid from the inside. "I'm not rejecting, I'm waiting for data." "I'm not being slow, I'm being prudent." Rogers spent decades showing that this internal narrative is how late majority justifies arriving late systematically. You don't realize you're in this bucket because the bucket has a beautiful story to tell you about yourself.

## Adoption is perceived, not objective

The second piece Rogers hammers and that technical founders ignore: adoption factors are **perceived**, not objective. Adoption doesn't depend on technology being good, it depends on it being perceived as good by the adopter.

Technical founders evaluate objectively: latency, throughput, failure modes, operational cost, scalability. Users evaluate subjectively: does it solve my pain now, does it cost less than what I use, can I trust it, is everyone I know using it. This mismatch is the heart of the error. We optimize for an axis the user can't even see, and we discard signals on the axes the user actually uses to decide.

Pix is the textbook case. I looked at "will state-run infra scale?". The user looked at "can I pay a bill without leaving the house, for free, on a Sunday night?". Both sides were correct about their own questions. The thing is, adoption is decided by the user's question, not the founder's. I was in another game, playing well - but on another board.

## Running Pix through DHM

Five years later, in 2026, I wrote about [running DHM in reverse at Buser](https://avelino.run/product-is-not-a-role-its-a-moment/) - Margin, Hard to copy, Delight, in that order, because the moment of the company calls for efficiency before delight. DHM is the framework I use today to prevent exactly the kind of error I made in 2021. And here's the cruel part: if I had run Pix through DHM in 2021, the error would have shown up on all three axes.

**Margin.** Pix had zero cost to me at checkout, against credit card fees (3-5%) and boleto cost (R$2-4 per issuance). In healthtech, low ticket and high volume, any extra percentage point of margin is direct differentiation. It's not optimization, it's structure. Margin went up on every checkout migrated, and at scale that's the difference between a healthy operation and one running on a thread. The most embarrassing part: I, as CTO, should have been the first to calculate this. Transaction cost is an engineering problem as much as a financial one. I didn't look because I was on the wrong question.

**Hard to copy.** Pix itself wasn't hard to copy - every competitor would eventually have it, it's public infrastructure. But **being ready first** was. Temporary competitive advantage lives exactly in that window between "technology available" and "everyone has implemented it". In a low-ticket market, competing on margin is existential - whoever implements first captures conversion and builds loyalty before the competitor knows what happened. Waiting for the big players was giving up the only hard-to-copy window available to me. I didn't lose the window - I handed it to competitors who made the opposite call in the same quarter.

**Delight.** Here Rogers screams. Brazilians had been in pain with boleto and TED for decades. Pix killed that pain in five ways: absurd relative advantage (free, instant, 24/7, against three days of clearing and high cost), full compatibility (it was an extension of the bank app everyone already used), minimal complexity (one key replaced agency + account + CPF + bank code), trivial trialability (one real to test with anyone) and maximum observability (everyone saw everyone using it, from the waiter to the Uber driver, and visible adoption accelerates adoption). Delight wasn't a hypothesis, it was inevitability. Rogers' five factors, applied to Pix, had no nuance - it was an absolute 5/5.

Three out of three by the criteria I myself defend today. Five out of five by the criteria Rogers described in 1962. Two frameworks separated by sixty years, both screaming, both ignored.

## The S-curve math

There's a part that makes "wait for the big players" a losing strategy not by chance, but by mathematical design. Rogers' S-curve of adoption has an inflection point - the takeoff - where early adopters convince early majority and the thing explodes. Before takeoff, adoption looks linear and modest. After takeoff, it's exponential until saturation.

![Pix adoption S-curve - % of Brazilian adults who have used Pix, with projection through 2028](/blog/pix-adoption.png)

The skeptical founder waiting for "validation from the big players" is waiting for a signal that comes **after** takeoff. By construction. Big banks, big retailers, big competitors - they also use external validation to move. By the time they move visibly, takeoff has already happened. You always arrive late by math, not by laziness. The window of advantage that exists between "technology available" and "technology mainstream" is exactly the interval between innovators/early adopters and late majority. Waiting for validation from the big players is by definition giving up that entire window.

Worse: the S-curve has a property that skeptics chronically underestimate. The slope after takeoff is steeper than linear intuition suggests. Technical founders evaluate adoption in monthly windows ("I'll check how it's going in three months") and the S-curve responds in weekly windows when it engages. By the time you revisit to "check in", it's no longer early - it's late, and the time it takes to implement is the time the competitor uses to consolidate the advantage you gave up.

## The rule that stuck

What did I look at instead of the real signals? I asked the wrong questions. "The state will run this, it's going to break." "Big banks will sabotage it because they lose float." "Key UX will confuse older users." All reasonable concerns. All irrelevant. I was answering questions about implementation risk while the question on the table was adoption velocity. Technical lens applied to a problem that wasn't technical.

The rule that stuck with me: when a technology hits Rogers' factors, passes through the three DHM axes, and the cost to implement is low, you don't wait for external validation. You ship. The downside is dev time. The upside is being ready when the curve turns - and the curve always turns faster than the skeptical founder thinks.

The rule has a corollary that matters more than the rule itself: technical founders need a framework that **forces** them to look outside the technical lens, because alone we tilt inward every time. DHM serves this purpose. Rogers serves this purpose. It's not intellectual decoration, it's a guardrail against your own bias. You don't escape the bias by being smart - you escape it by installing process that obliges you to ask questions you naturally wouldn't.

I lost months betting against Pix. Rogers had the manual sitting on a shelf for sixty years. DHM would have caught the error in any roadmap review. Next time the manual is on the shelf, I'll read it.
