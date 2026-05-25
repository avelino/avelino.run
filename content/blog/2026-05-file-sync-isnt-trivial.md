---
date: "2026-05-25"
draft: false
title: "File sync isn't trivial, and nobody tells you that"
tags: ["sync", "crdt", "distributed-systems", "notes", "outliner", "paper", "algorithms", "lisp"]
description: "File sync between devices looks like a UX detail. It isn't. I spent a weekend dissecting the 2021 Kleppmann paper that proves why Dropbox and Google Drive still get this wrong."
url: "/file-sync-isnt-trivial"
---

You drag a folder in Dropbox and it shows up on your other devices. You move a bullet in Roam and the other computers see the right tree. You rename a file in Logseq and your phone syncs. Looks like a UX detail.

It isn't. Underneath, this is a distributed systems problem with no obvious solution, and products with hundreds of millions of users still get it wrong in 2026.

I spent a weekend on this because I've been using outliner-first note systems for years, and the sync pain has always been there. [Logseq](https://logseq.com) syncs via markdown. Brilliant, but it breaks when the same file is edited offline in two places. The core team has been migrating to a database for years to fix this. No stable version yet.

I use [Roam Research](https://roamresearch.com) today. Also brilliant. But cloud first. No local files. My second brain can't depend on a server being up.

I wanted to understand why nobody solved this properly. I landed on a paper that breaks the problem down end to end: [A highly-available move operation for replicated trees](https://martin.kleppmann.com/papers/move-op.pdf), Kleppmann et al, 2021. 14 pages. Formal proof in [Isabelle/HOL](https://isabelle.in.tum.de/). [Source on GitHub](https://github.com/trvedata/move-op). The paper opens by demonstrating real bugs in Dropbox and Google Drive. Bugs that are still there today.

This post is the algorithm dissected. Data structure, code, execution walkthrough, complexity. The code is in Common Lisp, written as plainly as I could (no advanced functional programming, no macros, no tricks). If you read Pascal in college, you read this.

## What goes wrong

The authors tested with the official Mac clients. They disabled wifi on two machines, ran concurrent operations on each, turned wifi back on, and measured the result.

**Scenario 1.** Replica 1 moves `A` into `B`. Replica 2, at the same time, moves `A` into `C`. They sync. Dropbox duplicates: it creates `A` inside `B` and `A'` inside `C`. Two users who think they're editing the same node start editing copies that diverge forever. Google Drive resolves it with timestamps. A single `A`. Correct behavior.

**Scenario 2.** Replica 1 moves `B` into `A`. Replica 2, at the same time, moves `A` into `B`. Each operation is valid in isolation. Together, they form a cycle (A is B's parent, B is A's parent). Dropbox duplicates again. Google Drive locks up with a permanent *unknown error*. Sync stops. The broken device stays out of sync until someone manually moves the folders to match. The authors reported the bug.

These are reproducible bugs in products hundreds of millions of people use. Not an obscure corner. Basic filesystem operations done wrong.

[Najafzadeh in 2018](https://hal.inria.fr/tel-01351187v1) had proposed two ways out: either duplicate nodes (Dropbox's choice), or use a synchronous lock (kills offline). And he wrote: *"no file system can support an unsynchronised move without anomalies, such as loss or duplication"*. Kleppmann refuted that in 2021.

The thesis fits in one sentence. **Order every operation by timestamp and use undo/redo to slot remote ops into the right position in the log.** That converges. That is proven in Isabelle/HOL. And the rest of this post is how that mechanism works, in code.

## Data structure

Each replica keeps two pieces of state: the current tree, and a log of applied operations.

```lisp
;; a triple represents one parent-child relationship in the tree
(defstruct triple
  parent     ; id of the parent node
  metadata   ; file name, sibling order, etc
  child)     ; id of the child node

;; log entry: what you need to undo an operation
(defstruct log-move
  timestamp     ; unique, totally ordered (Lamport)
  old-parent    ; previous parent id of the child, or NIL if it didn't exist
  old-metadata  ; previous metadata, or NIL
  new-parent    ; new parent id
  metadata      ; new metadata
  child)        ; id of the moved child

;; one replica's state
(defstruct replica
  tree   ; list of triples
  log)   ; list of log-move, ordered by descending timestamp
```

The tree is a set of triples. Each triple says "child is a child of parent with metadata X". The critical invariant is *unique parent*: for any `child` in the tree, exactly one triple has that `child`. This invariant is what keeps the structure a tree. Not a DAG. Not a graph.

`metadata` carries whatever is domain-specific. In a filesystem, it's the file name inside the parent directory. In an outliner, it's the order between siblings. The algorithm is generic over the type.

The timestamp doesn't need to come from a physical clock. A [Lamport timestamp](https://lamport.azurewebsites.net/pubs/time-clocks.pdf) (1978) is enough: monotonic per replica, totally ordered across replicas via `(counter, replica-id)`. Unique, comparable.

The only protocol operation is `move`:

```lisp
;; "at time t, move node c to be a child of p with metadata m"
(defstruct move-op
  timestamp
  new-parent
  metadata
  child)
```

No `create`. No `delete`. Creating is moving a fresh ID under an existing parent (the node starts existing implicitly). Deleting is moving to a *trash* node outside the visible tree. Three conceptual operations, one protocol operation. This collapses the state space the proof has to cover and eliminates cross-interactions (create-after-delete, delete-then-move).

Basic helpers I'll use below:

```lisp
(defun find-parent (tree child-id)
  "Returns the triple where child-id is the child, or NIL if it doesn't exist."
  (dolist (tr tree)
    (when (equal (triple-child tr) child-id)
      (return tr))))

(defun is-ancestor-p (tree ancestor-id descendant-id)
  "True if ancestor-id is an ancestor of descendant-id in the tree.
   Walks up the parents until reaching the root or finding ancestor-id."
  (let ((current descendant-id))
    (loop
      (let ((parent-triple (find-parent tree current)))
        (when (null parent-triple)
          (return nil))  ; reached the root without finding it
        (when (equal (triple-parent parent-triple) ancestor-id)
          (return t))    ; found
        (setf current (triple-parent parent-triple))))))
```

`is-ancestor-p` is O(d) where `d` is tree depth. It gets called on every `do-op` to check for cycles.

## `do-op`: the primitive application

`do-op` applies one `move-op` to the tree and produces a `log-move` entry. It's the atomic piece of everything else.

```lisp
(defun do-op (op tree)
  "Apply op to tree. Returns (values new-tree log-entry)."
  (let* ((child-id    (move-op-child op))
         (new-parent  (move-op-new-parent op))
         (current     (find-parent tree child-id))
         (old-parent  (when current (triple-parent current)))
         (old-meta    (when current (triple-metadata current)))
         (log-entry   (make-log-move
                       :timestamp    (move-op-timestamp op)
                       :old-parent   old-parent
                       :old-metadata old-meta
                       :new-parent   new-parent
                       :metadata     (move-op-metadata op)
                       :child        child-id)))

    ;; check 1: would the op create a cycle? then drop the effect but keep it in the log
    (when (or (equal child-id new-parent)
              (is-ancestor-p tree child-id new-parent))
      (return-from do-op (values tree log-entry)))

    ;; apply: remove child from its current parent and insert under the new one
    (let ((new-tree (remove-if (lambda (tr)
                                 (equal (triple-child tr) child-id))
                               tree)))
      (push (make-triple :parent   new-parent
                         :metadata (move-op-metadata op)
                         :child    child-id)
            new-tree)
      (values new-tree log-entry))))
```

Two details decide everything.

**Detail 1, the cycle check is local.** `is-ancestor-p` walks the parents of `new-parent` up to the root and checks whether it passes through `child`. Cost O(d). If it does, the op would create a cycle in the current state. Drop the effect, keep it in the log. Why keep it? Because the current state can change when another op with a smaller timestamp arrives later and breaks that ancestry relationship. The op may become valid in the future.

**Detail 2, `log-move` carries `old-parent`.** That's what makes undo possible. Without it, undo is impossible: you don't know where to send the child back to.

## `undo-op` and `redo-op`: the reversal cycle

```lisp
(defun undo-op (log-entry tree)
  "Invert the effect of a log entry on the tree."
  (let* ((child-id  (log-move-child log-entry))
         (old-p     (log-move-old-parent log-entry))
         (old-m     (log-move-old-metadata log-entry))
         (cleaned   (remove-if (lambda (tr)
                                 (equal (triple-child tr) child-id))
                               tree)))
    (if (null old-p)
        cleaned   ; child didn't exist before, it disappears
        (cons (make-triple :parent old-p :metadata old-m :child child-id)
              cleaned))))

(defun redo-op (log-entry replica)
  "Reapply a log entry via do-op. Recomputes old-parent because the
   current state may differ from the state at the original application."
  (let ((op (make-move-op
             :timestamp  (log-move-timestamp log-entry)
             :new-parent (log-move-new-parent log-entry)
             :metadata   (log-move-metadata log-entry)
             :child      (log-move-child log-entry))))
    (multiple-value-bind (new-tree new-entry)
        (do-op op (replica-tree replica))
      (make-replica
       :tree new-tree
       :log  (cons new-entry (replica-log replica))))))
```

`undo-op` is the inverse of `do-op`. It pulls the child out of its current position and puts it back where `old-parent` says it came from. If `old-parent` is `NIL`, the child disappears (it didn't exist before that move).

`redo-op` reapplies via `do-op`. It doesn't reuse the old `log-move`: it builds a new one. The `old-parent` may be different now, because ops with smaller timestamps arrived between the original application and the redo.

## `apply-op`: where the trick lives

```lisp
(defun apply-op (op replica)
  "Apply op while preserving timestamp order.
   If op is older than the log head, undo, recurse, redo."
  (let ((log (replica-log replica)))

    ;; empty log: apply directly
    (when (null log)
      (multiple-value-bind (new-tree log-entry)
          (do-op op (replica-tree replica))
        (return-from apply-op
          (make-replica :tree new-tree :log (list log-entry)))))

    (let ((head (first log))
          (rest (rest log)))

      (cond
        ;; op is newer than the head: it becomes the new head
        ((>= (move-op-timestamp op) (log-move-timestamp head))
         (multiple-value-bind (new-tree log-entry)
             (do-op op (replica-tree replica))
           (make-replica :tree new-tree
                         :log  (cons log-entry log))))

        ;; op is older: undo the head, recurse on rest, redo the head
        (t
         (let* ((tree-without-head (undo-op head (replica-tree replica)))
                (replica-without-head (make-replica
                                       :tree tree-without-head
                                       :log  rest))
                (replica-with-op (apply-op op replica-without-head)))
           (redo-op head replica-with-op)))))))
```

The log is kept in descending timestamp order, head being the most recent. When an op arrives with a timestamp smaller than the head:

1. Undo the head with `undo-op`, restoring the previous state.
2. Recurse on `rest` with the new op. Recursion keeps undoing until it finds an entry with a timestamp smaller than the new op's, or until the log is empty.
3. When recursion comes back, the op has been applied at the right position.
4. Redo, in ascending order, the entries that were undone.

The end state is as if every op had arrived in timestamp order. Even when they didn't.

A local op always has the largest timestamp seen so far (property of the local Lamport clock). It hits the first `cond` branch: apply directly, become the new head, cost O(d) for the cycle check only. No undos. That's why local ops are fast (1µs to 2µs in the paper's benchmark).

A remote op with a `timestamp` close to the head: few undos. A remote op with a `timestamp` far in the past: undo down to the right slot, apply, redo everything back up.

## Walkthrough of scenario 2

The one that locked up Google Drive. Initial state: `A` and `B` are siblings under `root`. Metadata simplified as a string.

```lisp
(setf tree
      (list (make-triple :parent 'root :metadata "A" :child 'A)
            (make-triple :parent 'root :metadata "B" :child 'B)))
```

Replica 1 generates `(move 10 A "B" B)`: "move B inside A, at time 10".
Replica 2 generates `(move 20 B "A" A)`: "move A inside B, at time 20".

`10 < 20`. The two ops arrive at each replica in reverse order.

**Replica 1, local application of `(move 10 A "B" B)`:**

`is-ancestor-p` returns NIL (B is not an ancestor of A in this state). `do-op` applies.

```lisp
;; state after
tree = ((:parent A    :metadata "B" :child B)
        (:parent root :metadata "A" :child A))

log  = ((:timestamp 10 :old-parent root :old-metadata "B"
         :new-parent A :metadata "B" :child B))
```

**Replica 1 receives `(move 20 B "A" A)` from replica 2:**

`20 > 10`, hits the first branch, applies directly. `is-ancestor-p tree A B`? Yes, A is an ancestor of B now (after the previous move). `do-op` records the `log-move` but **doesn't change the tree**.

```lisp
;; state after
tree = ((:parent A    :metadata "B" :child B)
        (:parent root :metadata "A" :child A))   ; unchanged

log  = ((:timestamp 20 :old-parent root :old-metadata "A"
         :new-parent B :metadata "A" :child A)   ; effect dropped
        (:timestamp 10 :old-parent root :old-metadata "B"
         :new-parent A :metadata "B" :child B))
```

The op stays in the log with its original `old-parent`, but the tree doesn't move. Replica 1 ends with B inside A.

**Replica 2, local application of `(move 20 B "A" A)`:**

`is-ancestor-p` returns NIL. `do-op` applies.

```lisp
;; state after
tree = ((:parent B    :metadata "A" :child A)
        (:parent root :metadata "B" :child B))

log  = ((:timestamp 20 :old-parent root :old-metadata "A"
         :new-parent B :metadata "A" :child A))
```

**Replica 2 receives `(move 10 A "B" B)` from replica 1:**

`10 < 20`, needs reordering. Hits the second `cond` branch.

Step 1, `undo-op` on the head: restores A back to root.

```lisp
tree = ((:parent root :metadata "A" :child A)
        (:parent root :metadata "B" :child B))
log  = ()  ; empty
```

Step 2, recursion with empty log: applies `(move 10 A "B" B)` directly. `is-ancestor-p tree B A`? No. `do-op` applies.

```lisp
tree = ((:parent A    :metadata "B" :child B)
        (:parent root :metadata "A" :child A))
log  = ((:timestamp 10 :old-parent root :old-metadata "B"
         :new-parent A :metadata "B" :child B))
```

Step 3, `redo-op` of the old head: applies `(move 20 B "A" A)` on the current state. `is-ancestor-p tree A B`? Yes. Effect dropped, log-move goes into the log with a recomputed `old-parent` (now A, no longer root).

```lisp
tree = ((:parent A    :metadata "B" :child B)
        (:parent root :metadata "A" :child A))   ; final

log  = ((:timestamp 20 :old-parent A :old-metadata "B"
         :new-parent B :metadata "A" :child A)   ; old-parent differs!
        (:timestamp 10 :old-parent root :old-metadata "B"
         :new-parent A :metadata "B" :child B))
```

Replica 2 ends with the same tree as replica 1: B inside A. **They converged without coordination. The smaller-timestamp op won.** The larger one was processed (it's in the log, it will propagate), but had zero effect on the tree.

The logs in the two replicas have the same content but with different `old-parent` in the `timestamp=20` entry. That's fine: `old-parent` is used for local undo, not as a convergence criterion. What needs to converge is the tree. And it does.

## Convergence: why `apply-op` commutes

The central theorem proven in Isabelle:

```
∀ ops1, ops2.
    (set ops1) == (set ops2)
    ∧ (distinct (timestamps ops1))
    → (apply-ops ops1) == (apply-ops ops2)
```

Two lists of `move-op` with the same elements in any order produce the same state. That's convergence.

The intuition behind the proof: `apply-op` maintains an invariant. The log stays in descending timestamp order, and the resulting `tree` is equivalent to the tree you'd get by applying the log back-to-front via `do-op`. Any application order ends at the same log (same set, same timestamp order) and therefore at the same `tree`.

The full proof is 2495 lines of Isabelle covering 59 lines of definitions. Runs in 3 minutes. Zero `sorry` (the equivalent of `TODO` in a formal proof). Three final theorems:

1. `apply-ops-unique-parent`: every node has at most one parent after any sequence of operations.
2. `apply-ops-acyclic`: the tree has no cycles after any sequence of operations.
3. `apply-ops-commutes`: applying a permutation produces the same state.

The guarantee isn't "passes the tests". It's "works for any execution, any number of replicas, any message ordering". Dropbox didn't pay that price. Google Drive didn't pay that price. That's why they have bugs.

## Complexity and real cost

`do-op` is O(d) because of `is-ancestor-p`. Tree depth.

`undo-op` is O(n) in the implementation above (`remove-if` scans the tree). O(1) amortized if the tree is a hash map indexed by child, which is the executable version in the paper. The paper extracts to Scala using a hash map.

`apply-op` worst case is O(k·d):
- `k` = how many log entries have timestamp larger than the new op
- `d` = tree depth (cost of `is-ancestor-p` on each redo)

Local op: `k=0`, cost O(d). 1µs to 2µs in the benchmark.

Remote op with recent `timestamp`: small `k`, few undos.

Remote op with very old `timestamp`: large `k`. In the benchmark, with 3 replicas in California, Ireland, and Singapore generating concurrent ops at high rate, the peak was 200 undos+redos per remote operation.

Throughput of the optimized implementation: 5,700 ops/s. Of the Isabelle-extracted version: 600 ops/s (the gap is code generation overhead, not the algorithm).

State machine replication with a single leader: 22,000 ops/s (4x more), but pays 145ms to 176ms of latency per operation (round trip to the leader). And it doesn't work offline.

For a note system on laptops and phones, with eventual sync, the tradeoff is obvious. Local latency matters. Data center throughput doesn't. Offline isn't optional.

## Limits and extensions

A few things the paper makes explicit.

**The log grows without bound.** It's truncatable once a timestamp becomes *causally stable*: no future op will have a smaller timestamp. In a FIFO network with a known replica set, that's the minimum of the latest timestamps seen from each replica. Ops below that threshold will never be undone, so they can leave the log.

**Sibling order doesn't exist by default.** In POSIX filesystems, siblings are unordered (`ls` sorts at display time). In outliners and XML, they are. The extension is to embed a list CRDT (RGA, Logoot) inside the `metadata` field and use the list-CRDT-generated ID to order siblings under the same parent. Works, adds complexity.

**Hardlinks are trivial.** Leaves reference inodes instead of holding data. Multiple leaves can point to the same inode. The tree structure doesn't change.

**Name collisions among siblings aren't prevented.** Two users create `notes/todo.md` at the same time on different replicas? The algorithm keeps both. Resolution is the application's job (rename one, prefix with replica-id, etc).

## The third option exists

Logseq picked markdown sync. Markdown is a state-transport format for one user's editor. It's not a distributed data structure. That's why they've been migrating to a database for years.

Roam picked cloud first. Solved the sync problem by delegating to the server. You don't have the file, you have an API. The technical complexity goes out, the third-party infra dependency comes in.

The third option exists and is proven. Local first. Sync via CRDT. Local files always available. Mathematical convergence. No mandatory central server. For trees with concurrent moves, this paper is the missing piece. [Automerge](https://github.com/automerge/automerge) integrated the algorithm later.

The question that opens the next chapter is whether you can build an outliner on top of this.

---

[move-op.pdf](https://martin.kleppmann.com/papers/move-op.pdf). 14 pages. 2021. [Source on GitHub](https://github.com/trvedata/move-op) with the verified Scala implementation and the Isabelle files to run the proof.

File sync isn't trivial. The people selling you the smooth interface don't tell you. The people running products used by hundreds of millions, still buggy in 2026, also don't tell you. The paper tells you. Now you know.
