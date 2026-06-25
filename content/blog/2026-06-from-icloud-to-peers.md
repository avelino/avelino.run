---
date: "2026-06-25"
draft: false
title: "The op log was peer-to-peer the whole time"
tags: ["sync", "crdt", "p2p", "iroh", "quic", "nat", "distributed-systems", "rust", "outl", "engineering"]
description: "iCloud Drive was a deliberate shortcut to prove the CRDT converges across real devices before I solved networking. Proof done, I swapped the file-pusher for a real network. This is how outl now syncs every client peer-to-peer over QUIC, with no server and no Apple, and the parts of 'peer-to-peer' the brochures skip."
url: "/from-icloud-to-peers"
---

A month ago I wrote about [building outl on the Kleppmann move-op paper](/from-paper-to-outliner). That post ended with a working sync: a terminal client on macOS and an iOS app, converging over iCloud Drive, no server, no merge dialogs.

iCloud was a deliberate shortcut, and I want to be honest about that before I bury it. I had one question to answer first: does this CRDT actually converge across real devices, two separate machines, not two processes on my laptop pretending to be peers? iCloud Drive answered it without me writing a line of networking. Drop the per-actor `ops-*.jsonl` files in the ubiquitous container, let Apple's daemon push them between devices, watch two replicas merge. A file-pusher I borrowed to validate the algorithm, and for that job it was exactly right.

The proof landed. The CRDT converged on two real devices, and once it had, the borrowed transport's ceiling was the only thing left in the room. Linux: no iCloud. Android: no iCloud. Anyone who doesn't want their notes on Apple's servers: no thanks. The algorithm was ready for a real network; iCloud was never going to be one.

So I swapped it. outl now syncs peer-to-peer over [iroh](https://github.com/n0-computer/iroh): QUIC, hole punching, a relay only when the network forces one. Desktop, mobile, TUI, the CLI, and the MCP server all talk the same protocol. iroh is the default transport, `transport = "file"` is the opt-out for iCloud/Syncthing diehards, and pairing is one command.

The interesting part is what didn't change. The op log, the CRDT, the on-disk format: untouched. Both transports deliver the exact same `ops-<actor>.jsonl` files. iCloud pushed those files so I could trust the merge; iroh ships them so anyone can. This post is the swap and everything under it.

## A transport swap, not a rewrite

The thing that made this a transport swap and not a rewrite: the data model never depended on iCloud. It was built for replication from the first commit, I just hadn't pointed it at a real network yet.

The shape on disk, from the last post:

```
ops/
├── ops-01HXY...A.jsonl   ; only device A writes here
├── ops-01HXY...B.jsonl
└── ops-01HXY...C.jsonl
```

One append-only file per device. Every mutation any client makes serialises into a `LogOp` (an HLC timestamp, the actor, the operation) and appends to that actor's file and nowhere else. Each replica reads everyone's files, merges them by HLC, replays the move-op algorithm. That's the whole CRDT.

Three properties of that layout are the reason P2P was a port and not a project:

The op log is the offline buffer. Each device accumulates its own ops while disconnected. There is no separate queue, no outbox, no "pending changes" table. The thing you sync is the thing you already wrote to disk.

Each device knows exactly what it has seen. `Storage::last_ts_per_actor()` walks the merged log and returns the highest HLC per actor. That map is a vector clock, free, computed from data already in RAM:

```rust
fn last_ts_per_actor(&self) -> Result<HashMap<ActorId, Hlc>, StorageError> {
    let mut map: HashMap<ActorId, Hlc> = HashMap::new();
    for op in self.cache.read().iter() {
        map.entry(op.actor)
            .and_modify(|h| if op.ts > *h { *h = op.ts })
            .or_insert(op.ts);
    }
    Ok(map)
}
```

Replay order doesn't matter. Ops merge by HLC with an actor tiebreak, so a device can receive them in any order and land on the same tree. A transport that delivers bytes late, out of order, or in bursts can't corrupt the result.

The only thing I had to build was a `SyncTransport` trait so iCloud and iroh were interchangeable, and a new implementation behind it. The file poller from the last post became `FileSyncTransport`. The new code is `IrohSyncTransport`. Client call sites didn't move.

The generalisation, once: if your sync is a CRDT over per-actor append-only logs, the transport is a detail. Swapping iCloud for QUIC touched zero lines of the algorithm. That's the payoff for putting the proof at the center and everything else at the edge.

## The wire: vector-clock delta sync over QUIC

When two devices connect, neither dumps its whole log. They exchange vector clocks and ship only the gap.

The protocol is small. ALPN `outl-sync/1`. Every message is a 4-byte big-endian length prefix and a body. The handshake is four messages on a single bidirectional QUIC stream:

```
1. initiator → responder:  SyncRequest  { workspace_id, vector_clock: A }
2. responder → initiator:  SyncResponse { vector_clock: B }
3. responder → initiator:  ops blob  (ops where op.ts > A[op.actor])
4. initiator → responder:  ops blob  (ops where op.ts > B[op.actor]), finish()
```

Both directions converge in one connection. The initiator sends its clock, learns the responder's, and each side computes the difference locally:

```rust
fn ops_missing_for(ops_dir, actor, peer_clock) -> Result<Vec<LogOp>> {
    // ... load every ops-*.jsonl
    all_ops.into_iter().filter(|op| match peer_clock.get(&op.actor) {
        None => true,                    // peer has never seen this actor
        Some(known) => op.ts > *known,   // op is newer than what the peer has
    }).collect()
}
```

The ops blob is JSONL: one `LogOp` per line, the same serialisation that's on disk, behind a 4-byte length prefix. No new format. The wire payload is literally lines from the jsonl files.

Offline catch-up falls out of this for free. A device that was dark for a week comes back, sends a vector clock that's stale for three actors, and gets back exactly the ops it missed from all three. No replay-from-zero, no snapshot, no "are you sure you want to overwrite." If peer B accumulated peer C's ops while A was gone, B hands them to A on reconnect. B relays for C without either of them planning it. The vector clock doesn't care who wrote an op, only whether you've seen it.

One guard on the ingest side. A received op whose HLC is more than 24 hours in the future gets dropped with a warning. A device with a wrong clock can otherwise poison the merge with timestamps no future write can beat. The gate is `now + 86_400_000` milliseconds; anything past it doesn't land.

And one boring bug that cost real data before I caught it: two ingest tasks writing the same actor's file at once. Without a lock, two `write_all` calls interleave at the syscall level and glue two JSON objects onto one line (`...}}{"ts":...`), and now that line won't parse and the ops behind it are gone. So every append to `ops/` goes through one process-global async mutex. A whole batch of `open + write_all + flush + sync_data` is atomic against every other writer. The lock is held across the fsync, not just the write. Durability and framing in the same critical section.

## Gossip is the fast path, the catch-up loop is the one I trust

Two devices on the same workspace need to know when to talk. Real-time, that's gossip.

The topic is `blake3(workspace_id)`. Not the directory path, which differs across devices (`~/outl-p2p` on the laptop, some container UUID on the phone). The workspace id is a stable token stored in `.outl/workspace-id`, so two devices in different folders hash to the same topic and meet on the same channel. When you commit, the transport broadcasts a tiny message on that topic: `workspace_id\nactor\nhlc`. A peer that hears it opens a stream and runs the delta sync above. Milliseconds, when it works.

"When it works" is doing a lot of lifting. Gossip on a mesh of phones bouncing between WiFi and LTE is best-effort, and best-effort is not a guarantee I'll put my notes on. The CLI never gossips at all, it's too short-lived to bother. So gossip is the optimisation, not the mechanism.

The mechanism is a loop:

```rust
const CATCH_UP_INTERVAL: Duration  = Duration::from_secs(8);
const MAINTENANCE_RESYNC: Duration = Duration::from_secs(10);
```

Every 8 seconds, each device reloads `peers.json` and, for any peer it hasn't successfully synced with in the last 10 seconds, runs a full delta sync. A peer in flight is skipped (an in-flight guard keeps two syncs to the same node from racing). A peer that just synced via gossip is skipped (still fresh). A peer that's been quiet for 10 seconds gets re-dialed whether gossip fired or not.

That `MAINTENANCE_RESYNC` window is the line between "sync usually works" and "sync works." Delta sync is a no-op when the clocks already match, so re-dialing a converged peer every 10 seconds costs a round-trip and zero writes. Cheap insurance against every flaky thing gossip sits on top of. I'd rather pay a heartbeat than debug "why didn't my note show up" over a carrier NAT.

The generalisation: a real-time push and a periodic pull are not redundant, they fail in different weather. Gossip dies on a flaky mesh. The poll dies if the process isn't running. Run both and the union covers cases neither does alone. The push makes it feel instant; the poll makes it actually converge.

## NAT is the actual adversary

Hole punching is the part of "peer-to-peer" the word hides. Two phones, both behind NATs, neither with a public address: there is no direct socket to open. iroh's relays solve the bootstrap. Both peers register a "home relay," the relay swaps their candidate addresses, both fire packets at each other at the same instant, and if the NATs cooperate a hole opens and the relay drops out of the data path. If they don't cooperate, the relay keeps forwarding.

The relay sees ciphertext. QUIC plus TLS 1.3, keyed to the peer identities. It can see which node ids are talking, when, and how much. It cannot see one byte of an op, a page title, a tag. Content is end-to-end encrypted; the relay moves sealed envelopes. outl ships with n0's public relays and a `[sync] relay_url` knob to point at your own. Running `relay.outl.app` is on the roadmap, not because n0's relays are a problem, but because "no third party, ever" should be a config flip, and the wiring is already there.

Some NATs never cooperate. Symmetric NATs map a different external port per destination, which is exactly what hole punching needs to be stable, and carrier-grade NAT on LTE is usually symmetric. An iPhone on cellular often can't be dialed at all. So the phone pulls. The catch-up loop means it doesn't matter who can reach whom: if A can't open a socket to B, B opens one to A on its next tick, and the sync is bidirectional regardless of who dialed. Asymmetric reachability, symmetric outcome.

Then there's the multipath stall, which is the most "I lost an evening to this" bug in the project. iroh 1.0 opens QUIC paths to every candidate address at once: LAN IPv4, relay, and any global IPv6 it found. On a LAN-only machine that IPv6 path goes nowhere, but iroh waits on it anyway, and the connection hangs for ~30 seconds (`PTO expired`, `MultipathNotNegotiated`) while a perfectly good IPv4 path sits there unused. iroh 1.0 exposes no public knob to turn multipath off. So every endpoint in outl binds IPv4-only as a deliberate stopgap:

```rust
fn n0_builder_ipv4_only(relay_url: Option<&str>) -> Builder {
    iroh::Endpoint::builder(presets::N0)
        .clear_ip_transports()        // drop 0.0.0.0 + [::]
        .bind_addr("0.0.0.0:0")       // re-add IPv4 only
        .expect("valid IPv4 socket")
    // ...
}
```

It has to be every endpoint. If one side still advertised an IPv6 path, the other could try it and re-trigger the stall, so dropping it on one end isn't enough. Stored peer addresses get the same treatment: when I decode a peer's `EndpointAddr`, I keep its IPv4 direct addresses and throw the IPv6 ones away. This is a stopgap with a revert condition written next to it in the code: when iroh ships multipath fallback that doesn't block a healthy path on a dead one, the whole `bind` module deletes and we go back to dual-stack. I want it gone. Until then, IPv4-only beats a 30-second hang.

## Pairing without a server

iCloud gave me one thing for free that P2P doesn't: trust. Two devices on the same Apple ID were already each other's. Take away the account and "which devices are allowed in this workspace" becomes a real question with a real handshake.

Each device generates an ed25519 keypair once, at `~/.outl/identity.key`, 32 raw bytes, `0o600`, per machine, never synced. The public key is the node id. Two devices sharing an identity would collide on the relay, so the key stays put.

Pairing is `outl peer pair`. It builds an endpoint, waits up to 5 seconds for it to learn its relay and direct addresses, and prints a ticket: base64 of the node's `EndpointAddr` (id, relay urls, direct addrs), as a string and a QR code. The other device dials the ticket on a separate ALPN, `outl-sync/pair/1`, and the two exchange one `PairingPayload` each over a single stream. Asymmetric order, because the dialer opened the stream it speaks first, then reads, so the single stream never deadlocks. Both sides write a `PeerEntry` into `<workspace>/.outl/peers.json` and they're paired.

One detail in there is load-bearing and took a corruption bug to find. The joiner adopts the host's workspace id, and it writes the new id to disk before flipping the in-memory handle:

```rust
fn adopt_workspace_id(&self, remote: WorkspaceId) {
    if let Err(e) = remote.write(&self.workspace_root) {
        warn!("persist adopted id failed, not adopting: {e}");
        return;  // do NOT adopt in memory if disk write failed
    }
    *self.workspace_id.write().unwrap() = remote.clone();
    let _ = self.wid_changed_tx.send(remote);
}
```

Flip memory first and the process can die in the gap, and on restart it reads the old id off disk and silently splits into two workspaces that never speak again. Disk first. The in-memory state is allowed to be behind disk; it's never allowed to be ahead of it.

`peers.json` lives per-workspace, not global, so peers travel with the graph. The membership list also gossips, every 5 seconds, tagged `outl-membership/1` to tell it apart from op announcements. Merge is add-only: a membership broadcast can teach you how to reach a peer that's already in your mesh, it can never inject a stranger. The topic is `blake3(workspace_id)`; only already-paired devices are even subscribed. The gossip adds reachability, never trust.

## The CRDT bug that only a real network could find

Here's the one that justifies the whole property-test suite.

`Op::Create` puts a new node under a parent. `Op::Move` re-parents an existing node, and it has always run a cycle guard: if the new parent is already a descendant of the node you're moving, the move would close a loop, so it's a no-op on the materialised tree (the op still goes in the log, untouched, because a later reorder can make it legal). Standard move-op.

`Create` skipped that guard. For two years it was fine, because on one device you cannot create a cycle: you can't create `C` under `B` if `B` is already under `C`, the editor won't let you express it. The op order an author generates is always sane.

Concurrent reordering doesn't respect author order. Two devices, no coordination:

```
Create(B, root)     ; B under root
Move(B, C)          ; C doesn't exist yet, guard sees no cycle, B→C is written
Create(C, B)        ; NO guard → B→C→B closes a loop
```

When those three ops arrive reordered on a third replica and the `Create(C, B)` lands last, an unguarded `Create` closes `B → C → B`. A cycle in a tree CRDT is not a cosmetic bug, it's the one invariant the whole structure rests on.

I did not find this by thinking hard. A property test found it. The convergence suite generates random ops across four actors, materialises them in multiple permutations of arrival order, and asserts every permutation lands on the same cycle-free tree. One permutation cycled. The fix is one condition, making `Create` behave exactly like `Move`:

```rust
// crates/outl-core/src/tree/op.rs
Op::Create { node, parent, position } => {
    if !self.nodes.contains_key(node) && !self.creates_cycle(*node, *parent) {
        self.nodes.insert(*node, (*parent, position.clone()));
    }
}
```

The generalisation, and it's the one I'd tattoo on a junior: single-device testing is not a subset of distributed testing, it's a different test that happens to share code. This bug was unreachable by hand and trivial for a generator that doesn't respect causal order. If your system can reorder operations, the thing that finds your bugs is the thing that reorders operations on purpose. Ship the property tests.

## Every client is a peer, including Claude

The goal was blunt: edit on any surface, it shows up everywhere, with nothing else open. That splits clients into two kinds.

Long-lived clients bring the transport up at boot and announce on every commit: desktop, mobile, the TUI, and the MCP server. That last one is the one I didn't expect to care about as much as I do. The MCP server is long-lived, so when I have Claude write into a journal through the outl MCP, those ops announce over iroh and land on my phone with no GUI open anywhere. The agent is just another peer.

Short-lived clients stay passive. `outl page create` runs in 200 milliseconds and has no business spinning up QUIC, which takes seconds to connect. So the CLI writes its op to `ops/` and exits, and relies on a co-resident long-lived peer plus the catch-up loop on every device to carry it. When a script genuinely needs to flush before it dies, `outl sync` brings the transport up, pushes, pulls, and exits.

The TUI has a wrinkle worth calling out, because it's the bug that taught me the two transports aren't an either/or. Desktop and TUI on the same machine share one identity, so the relay routes the phone's inbound sync to whichever process is listening, usually the desktop, which writes the received ops into the shared `ops/` directory. The TUI's iroh transport never saw those bytes on the wire. They appeared on disk, written by a co-resident process. So the TUI runs `FileSyncTransport` and `IrohSyncTransport` at the same time: iroh reacts to its own wire receipts, the file poller reacts to any peer file growing on disk, including ops a sibling process delivered. Either one alone leaves a hole.

Mobile has the hardest constraint: iOS suspends your sockets the moment the app backgrounds. No long-lived QUIC. The only way to sync in the background is to ask the OS for a window, so the app registers a `BGProcessingTask` and the handler reaches into Rust over a C ABI:

```rust
#[no_mangle]
pub extern "C" fn outl_ios_background_sync() -> bool {
    let Some(transport) = slot().lock().clone() else { return false; };
    transport.sync_now();
    std::thread::sleep(SYNC_WINDOW);   // 20s: iroh connect + delta sync
    true
}
```

The live transport is stashed in a `OnceLock` when it boots, the Swift handler calls this symbol on a background queue, it drives one sync, and it blocks ~20 seconds because that's a realistic ceiling for an iroh connect plus a delta exchange. Within the BGProcessingTask budget, outside the main thread. iOS decides when to grant the window; outl decides what to do with it.

## What the shortcut bought

The last post was honest about a ratio: it took longer to build the layers around the paper than to implement the paper. This swap proved the inverse is also true. Because the data model was right, replacing the entire transport, the thing that sounds like the scary part, was the easy part. The CRDT didn't notice. The op log didn't change. The hard work had already been paid, a year earlier, by refusing to let any state that has to converge live anywhere but the op log.

iCloud earned its place. It pushed files between two real devices so I could answer the only question worth answering early: does this thing converge off my laptop? It did, and that answer is the entire reason the rest of this was a port and not a gamble. A borrowed file-pusher was the right tool to validate a CRDT and the wrong tool to ship one, and knowing which is which is most of the job. When the algorithm outgrew the scaffold, I took the scaffold down.

What's left now is the network the log was written for: QUIC between peers, a relay only when the NAT demands one, no server holding your notes, no account deciding which devices are yours.

The paper proved the tree converges. iCloud proved it converges across devices. iroh is me building the network for everyone the log was always meant to reach.

---

**outl** is open source: [github.com/avelino/outl](https://github.com/avelino/outl)
