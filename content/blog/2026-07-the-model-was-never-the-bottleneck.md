---
date: "2026-07-03"
draft: false
title: "The model was never the bottleneck"
tags: ["ai", "engineering", "product", "buser"]
description: "We bought a design studio to make our models better. The bottleneck in ML was never accuracy, it's the handoff to the human who decides."
url: "/the-model-was-never-the-bottleneck"
---

We bought a design studio to make our models better.

[Buser](https://www.buser.com.br/) acquired [Designa](https://startups.com.br/negocios/ma/buser-compra-a-designa-e-dobra-aposta-em-ia-na-estrada/) this week. Nine years ago they built the UX of our first app. The headline is that model quality, not fleet size, decides our next decade. That's the soundbite. It's also not the hard part.

The hard part starts after the model is already good.

A pricing model outputs a number. An allocation model says move this bus. A demand model flags a route. None of that is a decision. It's a suggestion sitting in front of a human who takes it or ignores it. An operator on a shift. A partner running a fleet. A passenger deciding whether to trust the price. The model's output lives or dies in that gap, and the gap is not made of math.

Call the value of a model accuracy times adoption. Accuracy is what it gets right. Adoption is how often the human on the other end acts on it. You multiply the two. If adoption is zero, the product is zero. A model that is right and ignored ships nothing. Worse: the next point of accuracy, the one you bought the GPU for, multiplies against that same small adoption number. You paid to sharpen the factor that was never the constraint.

Adoption is not a property of the model. It's a property of the interface. Whether the operator understands what the model suggested, and why, well enough to act without a shrug. I've [argued this before](https://avelino.run/technical-founders-misread-adoption-rogers-pix/) about product adoption: it gets decided by the user's question, not the builder's. Here the operator is the user, and the model's suggestion is what they adopt or ignore.

Lisanne Bainbridge saw this in 1983, in a paper about industrial plants called [Ironies of Automation](https://ckrybus.com/static/papers/Bainbridge_1983_Automatica.pdf). The more you automate, the more the human's leftover job becomes the hard part. You step in exactly where the machine can't, with less context than ever, because the machine ran the easy middle and handed you the edge. Automation doesn't remove the human. It moves the human to the worst seat in the house: deciding under load, fast, with the reasoning hidden.

A few weeks ago I wrote that [reviewing code is not the same as writing it](https://avelino.run/reviewing-is-not-understanding/), because writing builds the theory of the program and reviewing only recognizes its shape. Same mechanic here, one layer up. An operator who eyeballs a suggestion and clicks approve is recognizing. An operator who understands why the model said move this bus and not that one is constructing. Recognition scales badly. The first suggestion that looks strange, trust breaks, and adoption falls to zero across every route at once.

The interface is where recognition turns into construction, or fails to. Not colors and spacing. Whether a human can rebuild enough of the model's reasoning to own the decision that follows. That is a design problem stacked on top of a machine learning problem, and almost nobody staffs the seam between them.

The reason is boring. Accuracy has a number. It goes on a dashboard, it climbs, it feels like progress. Handoff quality has no clean number, so it gets no budget. People fund what they can measure. The market sells bigger models, longer context, more GPU, because those ship with graphs. Nobody sells you the bridge, because the bridge only shows up as "adoption went up" three quarters later, and you can't put that on a slide with a straight line to the spend.

So we bought the people who build bridges. [Michel](https://www.linkedin.com/in/michelamaral/) and [Fábio](https://www.linkedin.com/in/f%C3%A1bio-rodrigues-30362560/) are in engineering now, next to the people training the models. Nine years ago they designed how a person buys a bus ticket. Now they design how a person trusts a machine's call. Same skill. The problem just moved up a layer.

The next decade isn't model quality. It's how much of that quality survives contact with the human who has to decide.
