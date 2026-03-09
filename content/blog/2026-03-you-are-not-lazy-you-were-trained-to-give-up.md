---
date: "2026-03-09"
draft: false
title: "You're not lazy. You were trained to give up"
tags:
  [
    "open-source",
    "developer-mindset",
    "jvm",
    "jbundle",
    "nonconformism",
  ]
description: "Your work environment can always be better, even if the solution doesn't exist yet. The problem isn't lack of skill. It's that you were conditioned to stop trying."
url: "/you-are-not-lazy-you-were-trained-to-give-up"
---

[Martin Seligman](https://www.amazon.com/Learned-Helplessness-Theory-Personal-Control/dp/0195044665) put dogs in a cage with an electrified floor. When they tried to escape, they couldn't. After a few attempts, they stopped trying.

Then he opened the cage door.

The dogs didn't move. They lay there, taking shocks, with the exit wide open in front of them.

Seligman called this **[learned helplessness](https://www.amazon.com/Learned-Helplessness-Theory-Personal-Control/dp/0195044665)**. The organism learns that its actions have no effect — and once it learns that deeply enough, it stops acting. Not out of laziness. Not out of incapacity. But because it was conditioned to believe that movement changes nothing.

Now stop for a second and think about the last time you deployed a JVM application. The "but the user needs Java installed" conversation. The GraalVM that seemed like the answer until you spent three days configuring reflection, discovered the library you need isn't compatible, and ended up shipping a `.jar` with a README explaining how to install the JDK. Everyone has lived with this long enough that it became background noise. That's just how it is. Always was. Always will be.

You learned not to leave the cage.

It wasn't a conscious decision. It was accumulation. You opened an issue that stayed open for months and closed without resolution. You proposed a workflow change and heard "that's how we've always done it." You started building an alternative and someone sent you three links to tools that "already do this" — none of them the way you needed, but the implicit message was clear: *quiet down, it already exists*. Over time, you stopped formulating the attempt before it even started. The resistance became automatic. Invisible. You call it being realistic.

The problem with learned helplessness is that it survives context changes. Seligman's dogs stayed still even after the cage changed — exit open, no more shocks. The conditioning wasn't in the cage. It was in the behavior. Same reason developers who switch companies bring the same passive patterns with them. A new environment doesn't undo the old learning automatically. You need deliberate action to recondition — you need to try leaving a few times and discover that this time it actually works.

## Complainer is helplessness with a narrative. Nonconformist is helplessness that became fuel

There's a dangerous confusion that needs to be cleared up: nonconformism is not a synonym for complaining a lot. They're opposites.

The complainer has a precise diagnosis. Knows exactly what's wrong, articulates it well, can convince the room the problem is real. And does nothing. Sometimes from lack of time, sometimes from fear of public failure, but mostly because they learned — at the behavioral level, not the conscious one — that building doesn't solve anything. So they refine the diagnosis. Get increasingly sophisticated at describing the problem. Become the person everyone agrees with, laughs nervously with in standup, and who hasn't moved the needle a centimeter in two years. The complainer is the dog describing the shock with clinical precision while still lying on the electrified floor.

The nonconformist feels the same discomfort. The difference is what they do with it.

Look at what happens when someone ignores that conditioning. [Ken Thompson](https://github.com/ken) and [Dennis Ritchie](https://en.wikipedia.org/wiki/Dennis_Ritchie) were dissatisfied with Multics. Bureaucratic, slow, ugly. Instead of adapting their workflow to the broken system, they built Unix on a discarded machine left in a Bell Labs hallway — basically out of nonconformism and the desire to keep running a game. [Linus Torvalds](https://github.com/torvalds) found Minix too limited, sent an email to the list saying he was making "an operating system, just a hobby, won't be big and professional like GNU," and today that hobby runs on 96% of the world's servers. [DHH](https://x.com/dhh) hated building web applications the way everyone else did — extracted Rails from Basecamp and redefined what productivity in web development means.

None of them were certain it would work. All of them were certain that the way things were, they weren't right. That's the distinction. Not optimism. Refusal to accept the shock as a permanent condition.

And there's the argument that kills more projects than any technical difficulty: *"but X already exists."* Every time someone presents a new tool, someone shows up with three links to alternatives. The argument seems reasonable on the surface — why duplicate effort? — but it hides a false premise: that the existence of a similar solution invalidates building a better one. Docker existed when Nix gained traction. WordPress existed when Ghost launched. "It already exists" is a historical observation, not a logical argument against building. When you hear it and stop, that's not humility — it's helplessness wearing intellectual clothing.

The nonconformist hears "it already exists" and thinks: *it exists, but not the way I think it should work.* That simple sentence is what separates people who use tools from people who create them.

Real nonconformism has a cost most people don't want to pay: you build in public, fail in public, ship incomplete in public. [jbundle](https://github.com/avelino/jbundle) isn't finished. It will never be "done" in the sense of complete and polished before it exists — because "done" is the fiction the complainer uses to justify not shipping. You only discover what the project needs to be when other people use it, break it, and complain the right way. Shipping early isn't carelessness. It's the only honest method of discovering whether the cage door is actually open.

## The door is open. But you have to move

Seligman didn't stop at the diagnosis — he studied how to reverse helplessness. The answer was physically guiding the dogs through the exit. Two, three times. Until they relearned that movement caused change. After that, they left on their own.

The equivalent isn't motivation. It's not reading about productivity or taking a course. It's building something concrete that solves a real problem you have — now, with what you have, without waiting for ideal conditions.

The problem of distributing JVM applications has existed for decades. The standard answer has always been "install Java" or "use GraalVM" — and anyone who's tried GraalVM in production knows the second option trades one problem for five. [jbundle](https://github.com/avelino/jbundle) was born from that irritation: packages any JVM application — Java, Clojure, Kotlin, Scala — into a self-contained binary using `jlink`. No GraalVM, no reflection configuration, no library incompatibilities. One file, zero external dependencies, runs anywhere.

[JabRef](https://github.com/JabRef/jabref) — a Java-based bibliographic reference manager, one of the most active Java open source projects in existence, with over 10 years of history and thousands of academic users — is exactly the kind of software that deals with this problem every week. New user, question in the forum: "how do I install it?" Answer: install Java first. It's a shock. It's background noise. It's normalized helplessness.

The solution isn't impossible. Nobody had the stubbornness to build it. Now someone does.

What's the thing in your workflow that annoys you every week and that you've learned to ignore? Not the one you already solved. The one you mention in conversation as "it's annoying but you can live with it." That's the electrified floor. That's the open door.

Most people will keep taking shocks and calling it professionalism. They'll get increasingly good at living with the problem — write a clearer runbook, automate the workaround, onboard the next developer into the same painful ritual with more efficiency. And the problem will keep existing, passed from generation to generation as technical inheritance, until someone decides they don't want it anymore.

You have at least one project like this waiting. The question isn't whether you have the skill. It's whether you still believe that leaving the cage changes anything.

---

*[github.com/avelino/jbundle](https://github.com/avelino/jbundle) — packages JVM applications into self-contained binaries. Work in progress, as it should be.*
