---
date: "2026-09-14"
draft: false
title: "The page I deleted came back"
tags: ["crdt", "distributed-systems", "sync", "move-op", "rust", "outl", "testing", "property-testing", "engineering"]
description: "I deleted a page on my laptop. It came back on my phone, under root, and survived a restart. The op log was intact and the tree built from it was wrong. The cause was a pair of functions that were supposed to be inverses and weren't. This is the measurement that located the defect, why my property suite refused to generate the shape that contained it, and the fix that added nothing to the wire."
url: "/the-page-i-deleted-came-back"
---

I deleted a page on my laptop. It came back on my phone, under `root`, where it had never been.

I restarted the app. It was still there. That was the part that made it a real problem rather than a rendering glitch: the wrong tree had been written to the snapshot cache, so the phone rebuilt itself wrong on every boot, and the iroh snapshot responder was prepared to serve that wrong tree to the next device that paired.

The op log was fine. Every operation was in it, including the delete. The log is [the source of truth](https://outl.app/blog/a-keystroke-should-never-wait-for-the-disk) and it had not lost a thing. The tree built out of it was simply wrong, in a way that depended on the order the operations arrived.

## The decision this grew out of

Two months ago I gave every page root a deterministic id derived from its slug, so that two devices creating the same day's journal land on one node instead of two competing roots. That fix [doubled the title of every journal opened on two devices](https://outl.app/blog/one-node-two-writers), which I wrote about at the time.

This is the same decision biting a third time, in a different place.

Deterministic ids mean a duplicate `Op::Create` for one node id is **routine**. Not a corner case, not malformed input from a buggy peer. Every journal you open on two devices produces one, each carrying whatever sibling position its own device computed. That is the design working: both devices name the same node, the lowest-HLC `Create` wins, everyone converges on one page.

That is what makes the next part matter.

## The pair that wasn't a pair

`do_op(Op::Create)` is idempotent. It looks at the node, sees it already exists, and leaves the tree alone.

`undo_op(Op::Create)` removed the node. Unconditionally.

So undoing a `Create` that had created nothing deleted a node somebody *else's* `Create` had made.

This only matters because of how a move-op tree stays available. When an operation arrives late - below the local tail of the log - the tree doesn't reject it and doesn't jam it on the end. It undoes operations until it reaches the right causal spot, applies the late one, and redoes everything it undid. That reordering loop is the entire reason the algorithm can accept concurrent edits from offline devices. I wrote about [what happens when you take that ability away](https://outl.app/blog/the-snapshot-i-couldnt-reorder).

The loop assumes one thing: **`undo_op` is the exact inverse of `do_op` for every operation, including the ones `do_op` ignored.** In the paper's Isabelle development that obligation is a lemma with a name, `do_undo_op_inv`. It's proven there for `Move`, which is the only operation the paper has.

`Create` is mine. I added the operation and inherited the obligation with it, and then didn't honor it.

## The minimal shape

```text
Create(n, P, "a") @1
Move(n, P, "t")   @2
Create(n, P, "u") @3
```

Delivered `[1, 2, 3]`, the node ends at position `"t"`. Delivered `[3, 1, 2]`, it ends at `"u"`.

Two devices, same three operations, two different trees. That alone is a convergence failure.

But trace the divergent order and it's worse than ordering. Undoing `Create@3` removes `n`. Then `do_op(Move@2)` goes looking for a node to move, finds nothing - outl's `Move` is not total over nodes that don't exist yet, so the `None` arm is a complete no-op - and does nothing at all. Then `Create@3` replays and re-materializes `n` at its creation position.

The `Move` is still in the log. Nothing was lost from storage; that invariant held throughout. But its **effect** is gone from the tree, and no amount of replaying the log will bring it back, because the replay is what erased it.

That's a user's edit disappearing while the log sits there intact, which is a considerably worse failure than a page appearing in the wrong order.

The version I actually hit is the one in the test named `a_duplicate_create_does_not_resurrect_a_trashed_node`: device A creates a page and deletes it, device B - which never saw either operation - creates the same page locally, on the same node id. The correct merge puts B's `Create` last in HLC order, where it is a no-op, and the page stays deleted everywhere. What happened instead was that one delivery order put it back under `root`.

## Where the defect actually lives

Before fixing it I wanted to know how exposed I'd been, so I measured the reorder loop on a real workspace: 217,811 operations.

The undo window was **0 for 217,663 of 217,663 operations**.

Every local path feeds `apply_op` an already-sorted log, so a full replay never undoes anything. Which means:

- **A single-device workspace never reaches this bug.** Boot from an ordered log and `undo_op(Create)` is never called at all.

- **Out-of-order delivery reaches it immediately.** A peer's operation arriving below the local tail is precisely the case the loop exists for.

And those two facts point the same direction. A duplicate `Create` *comes from* a second device. So the defect is dormant while a workspace is on one machine and becomes reachable at exactly the moment it becomes multi-device - which is the same moment that starts producing the duplicates that trigger it.

It had been in the code long before the work that made me look.

## Why nothing caught it

The convergence property suite is the piece of this project I trust most. It generates random operation sequences, delivers them to replicas in different orders, and asserts everyone agrees. It should have found this in minutes.

It never had a chance, because the generator refused to produce the shape. When lowering a random sequence, a second `Create` for an already-created node was rewritten into a `Move`, with a comment explaining that a duplicate `Create` was "NOT a well-formed CRDT input."

Both halves of that comment are false. A duplicate `Create` is well-formed - the lowest-HLC one wins, which is a property of the operation *set* and not of delivery order. And it isn't exotic: deterministic page ids make it the most common duplicate in production.

So the suite explored a large space, thoroughly, for months, and the bug was sitting just outside it behind a comment that explained why it wasn't worth testing.

A property test proves things about the inputs it can generate. The generator's exclusions are part of the specification, whether anyone writes them down as such or not. Mine had an exclusion that was load-bearing and wrong, and it was documented - which is worse than undocumented, because writing the reason down is what stops you from questioning it later.

The generator now emits duplicate `Create`s.

## The fix, and the field I didn't add

`do_op` now records whether *this particular operation* is the one that brought the node into existence, and `undo_op` removes the node only in that case.

```rust
// do_op
if !self.nodes.contains_key(node) && !self.creates_cycle(*node, *parent) {
    self.nodes.insert(*node, (*parent, position.clone()));
    self.created_by.insert(*node, ts);
}

// undo_op
if self.created_by.get(node) == Some(&log_op.ts) {
    self.nodes.remove(node);
    self.created_by.remove(node);
}
```

There are three outcomes `do_op` can have, and `undo_op` has to tell them apart: the node was inserted, the node was already there, or inserting would have made a cycle. Only the first has "remove it" as its inverse. The other two have the **identity** as their inverse - and the identity needs no stored value, which is why the absence of an entry is itself a sufficient record.

The subtle part is where the write goes. It's computed before the branch that might skip, not inside it, mirroring where the paper puts `get_parent tree c` at Fig. 4 l.28. A value written inside the `if` is a value that goes stale on the next replay.

`Tree::created_by` is a `HashMap<NodeId, Hlc>` that lives beside the tree. **Nothing was added to the wire.** No `Op` variant changed shape, the JSONL serializes byte-identically in both directions, and there is nothing to migrate.

That was a choice, and the obvious alternative is defensible: add `old_placement: Option<(NodeId, Fractional)>` to `Op::Create` with `#[serde(default)]`. It's uniform with `Move`, `SetProp` and `SetCollapsed`, which all carry their own `old_*` fields, and the migration is genuinely free since `do_op` overwrites the field before any `undo_op` could read the default.

I didn't take it for two reasons, in this order. It puts undo-only local derivation onto the sync surface for the most frequent operation in the log - which is the exact mistake `Op::Move::old_parent` already made, and the one field in the format I'd remove if I could, because anybody reading the log as data will misread it as something meaningful about the move. And it isn't a local change: 93 struct literals across six crates stop compiling, most of them just to add the token `None`.

Both designs are correct. If the uniformity later looks worth the wire field, converting is mechanical - move the lookup into the field, delete the map, and none of the tests change.

## What the paper would actually tell me to do

Get rid of `Op::Create` entirely.

§3.6 is explicit: no separate operations for creation and deletion are needed, because a node is implicitly created the first time it's moved. One operation, one proof, no extension to get wrong.

That's the right end state and it isn't one change. It requires `do_op(Move)` to become total over nodes that don't exist yet, which makes `Op::Move::old_parent` an `Option` - the same problem on a bigger variant. It reinterprets logs that already exist, because `Create` stops being first-write-wins and becomes last-write-wins, so a workspace where a `Create` sits above a `Move` on the same node materializes differently after the upgrade than before. And a `Move` for a node whose `Create` hasn't arrived yet materializes a phantom node, which in outl isn't an abstract tuple - it's a visible empty bullet in your markdown file.

So it's staged, and this fix is step one. `created_by` gets deleted along with the variant when step four lands.

## The other one: a scan that keeps coming back

The same release removed a full log scan for the third time.

Rebuilding one block's text means replaying *that block's* `Edit` operations. There's an index for it, `edits_by_node`, which answers in time proportional to the edits of that node. The tempting alternative is `log.iter().filter_map(..)`, which returns **exactly the same bytes** in time proportional to the whole log.

That identical-output property is the entire problem. No correctness test can tell the two apart. So the scan got reintroduced twice after being fixed once:

- `block_text` scanned per block. Fixed in #179.

- `ContentStore::ensure_doc` had the identical defect one function away, and wasn't fixed with it - so the first keystroke on a cold block after a full-replay boot scanned all 217,811 operations, on the foreground thread.

- `materialize_text_from_log` carried a third copy, latent, reachable only when an earlier pass failed to drain its pending queue.

All three now route through one function. But a fix that has failed twice needs a guard, and a guard for this is awkward: since the outputs are identical, the only observable difference is cost, and a test that measures cost is usually a flaky test.

What keeps it honest is that it asserts a **ratio across log sizes** rather than an absolute duration. It doesn't care how fast your machine is. A test that merely asserted "this is fast" would go red on a loaded CI runner and teach everyone to ignore it.

The first version of that guard was wrong too, and in a way worth admitting: it claimed the indexed ratio was about 1, against roughly the growth factor for a scan, and called that margin enormous. Neither half held. It went red on CI at 5.5x with the index in place and nothing actually broken.

So I measured instead of assuming, by injecting the scan back into the path the test times:

| log growth factor | indexed | scanned |
|---|---|---|
| 20 | 2.2-4.2x | 6.5-6.7x |
| 50 | 2.3-4.0x | 13.1-25.6x |

The indexed ratio isn't 1 because only the replayed work is constant. The read also pays a lookup in three different maps, all of which grow with the log, and at the ~16µs the fast case takes those cache misses dominate three `Edit` replays. That floor is real, so the two bands can only be pushed apart from above: growing the log costs a scan proportionally and costs the index almost nothing.

At a growth factor of 20 the bands nearly touch - 4.2 against 6.5 - and any bound between them is a coin flip on a loaded runner. That's the 5.5x failure. At 50 they're a factor of three apart, and the bound sits at 8: twice the worst honest run, comfortably under the cheapest scan.

## What both of these have in common

Neither bug was hard to fix. The `Create` change is six lines and the scan removal deleted more code than it added.

Both were hard to *see*, and in the same way: my test suite had a shape it structurally could not observe. One was excluded by a generator, behind a written justification. The other produces byte-identical output, so no assertion about correctness could ever separate the right implementation from the wrong one.

The lesson I'd take out of it isn't "write more tests." It's that a test suite has edges, the edges are part of the specification, and the comments explaining why something is out of scope are the first place to look when a bug survives a suite you trust. The exclusion I'd written down was the one I stopped questioning.

---

**outl** is a local-first markdown outliner with a tree-CRDT and peer-to-peer sync, no server in the middle. The tree is in `[crates/outl-core/src/tree](https://github.com/outlmd/outl/tree/main/crates/outl-core/src/tree)`, the fix is RFC 0263, and it's all open: [github.com/outlmd/outl](https://github.com/outlmd/outl).
