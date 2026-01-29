---
date: "2026-01-29"
draft: false
title: "FFI with GraalVM Native Image: The Real Work of Maintaining a Library That Crosses Language Boundaries"
tags:
  [
    "ffi",
    "graalvm",
    "native-image",
    "rust",
    "clojure",
    "database",
    "open-source",
    "chrondb",
  ]
description: "It's not about compiling to native and calling it done. It's about stack overflows in unexpected places, locks that survive crashes, and data that vanishes between processes. Battle documentation from maintaining ChronDB."
url: "/ffi-graalvm-native-image-real-work"
---

Exposing a library via FFI seems simple on paper.

You compile your code to `.so`, export some functions with `extern "C"`, write bindings in the target language. Done, interoperability achieved.

Except that's not how it works in practice. At least not when your lib is a database written in Clojure, compiled with GraalVM native-image, that needs to manage Git and Lucene internally, and will be called from Rust in environments ranging from dev laptops to CI containers with 8MB of stack.

Over the past few months, I've worked on this exact scenario with [ChronDB](https://github.com/moclojer/chrondb). Every bug fixed became a lesson about how different languages coexist in the same process — and about everything that can go wrong in that coexistence.

## The Scenario: Why FFI with GraalVM?

ChronDB is a temporal database. It uses Git as storage (each write is a commit) and Apache Lucene for full-text indexing. The core is Clojure running on the JVM.

The problem: not everyone wants (or can) run a JVM. Rust developers want a crate. Python developers want a pip package. Embedding an entire JVM in each application isn't viable.

The solution: GraalVM native-image compiles Java/Clojure bytecode to native binary. You generate a `libchrondb.so` that can be loaded via `dlopen` from any language. No ~~JVM~~, no classpath, no **JAR hell**.

```
┌─────────────────────────────────────┐
│  Your application (Rust/Python/Go)  │
├─────────────────────────────────────┤
│         dlopen + FFI                │
├─────────────────────────────────────┤
│   libchrondb.so (GraalVM native)    │
│   ├── SubstrateVM runtime           │
│   ├── Clojure core                  │
│   ├── JGit (Git operations)         │
│   └── Lucene (indexing)             │
└─────────────────────────────────────┘
```

It works. Until it doesn't.

## Problem 1: StackOverflowError on `put()`

First real issue that appeared. User opens the database, does `get()`, all good. Calls `put()`, crash:

```
Fatal error: StackOverflowError: Enabling the yellow zone of the stack
did not make any stack space available.
```

### Why it happens

When you compile Java to native-image, GraalVM embeds a minimalist runtime called SubstrateVM. Each "instance" of this runtime is an **Isolate** — an execution context with its own heap and state.

When external code calls an FFI function (`@CEntryPoint`), SubstrateVM needs to:

1. Register the calling thread in the runtime (so GC knows about it)
2. Configure stack guards (yellow zone, red zone)
3. Allocate space to capture stack trace if an exception occurs

That third point is the problem. SubstrateVM allocates space for a **complete** stack trace at the entry point. With **Clojure + JGit + Lucene**, a `put()` has hundreds of frames:

```
ChronDB_put (entry point)
  └→ clojure.lang.RT.var()
      └→ chrondb.lib/lib-put
          ├→ JGit ObjectInserter.insert()
          │   ├→ PackInserter → SHA1.digest()
          │   └→ RefUpdate → FileChannel.lock()
          └→ Lucene IndexWriter.addDocument()
              └→ DocumentsWriter → DefaultIndexingChain
                  └→ TermsHashPerField → ByteBlockPool
```

GraalVM needs ~64MB of stack for this. Default Linux stack? 8MB. macOS varies, but usually less than needed.

### The solution that doesn't work

Documentation suggests `RUST_MIN_STACK=64MB`. Doesn't work because:

- Only affects threads created **after** the env var is set
- Main thread already exists
- Runtime threads **(Tokio, Rayon)** use their own defaults

### The real solution

Ensure that **all** FFI calls happen on a thread with sufficient stack. I implemented a dedicated worker thread:

```rust
impl ChronDB {
    pub fn open(data_path: &str, index_path: &str) -> Result<Self> {
        let (command_tx, command_rx) = mpsc::channel();

        // Worker with 64MB stack
        let handle = thread::Builder::new()
            .stack_size(64 * 1024 * 1024)
            .spawn(move || {
                let lib = load_native_lib();
                let db_handle = unsafe { lib.open(data_path, index_path) };

                // All FFI calls here
                while let Ok(cmd) = command_rx.recv() {
                    match cmd {
                        Command::Put { key, value, tx } => {
                            let result = unsafe { lib.put(db_handle, &key, &value) };
                            tx.send(result);
                        }
                        Command::Shutdown => break,
                    }
                }
            })?;

        Ok(Self { command_tx, handle })
    }
}
```

User calls `db.put()`, internally it becomes a message to the worker, worker executes FFI with 64MB stack, returns result via channel.

Transparent to the user. Works in any environment.

## Problem 2: Database Won't Open After Crash

Second issue. User kills the process with Ctrl+C in the middle of an operation. Tries to reopen:

```
Database(OpenFailed(""))
```

Empty error. Very helpful for debugging.

### Why it happens

JGit and Lucene use file locking to prevent concurrent access:

- Git: `HEAD.lock`, `index.lock`, `refs/heads/main.lock`
- Lucene: `write.lock`

These are **advisory locks** from the operating system. The kernel releases them automatically when the process terminates... normally.

But the **`.lock` file stays on disk**. And JGit checks for file existence, not the lock itself:

```java
// JGit LockFile.java
public boolean lock() throws IOException {
    if (lockFile.exists()) {
        return false;  // Assumes another process has the lock
    }
    // ...
}
```

> Kill -9, OOM killer, power loss — any abnormal termination leaves the file orphaned.

### The solution

Before opening, verify if locks are actually active. The technique: try to acquire the OS advisory lock. If you succeed, the file is orphaned.

```clojure
(defn orphaned-lock? [lock-file]
  (try
    (with-open [channel (FileChannel/open (.toPath lock-file)
                          (into-array [StandardOpenOption/WRITE]))]
      (if-let [lock (.tryLock channel)]
        (do (.release lock) true)   ; Got it = orphaned
        false))                      ; Didn't get it = in use
    (catch OverlappingFileLockException _ false)))

(defn cleanup-orphaned-locks [directory]
  (doseq [f (find-lock-files directory)]
    (when (orphaned-lock? f)
      (.delete f))))
```

The kernel maintains a lock table by inode. Process died? Kernel already cleaned up its locks. If `tryLock()` succeeds, no living process has the lock.

And about the empty error? Fixed too:

```clojure
;; Before: returned nil silently
(defn lib-open [data-path index-path]
  (when-let [storage (create-storage data-path)]
    (when-let [index (create-index index-path)]
      (register-handle storage index))))

;; After: propagates error with context
(defn lib-open [data-path index-path]
  (try
    (let [storage (create-storage data-path)
          index (create-index index-path)]
      (register-handle storage index))
    (catch Exception e
      (log/error e "lib-open failed" {:data-path data-path})
      -1)))
```

## Problem 3: Data Disappears Between Processes

Third issue, the most frustrating. Flow:

```bash
myapp save-state    # Saves data to ChronDB
myapp load-state    # Data doesn't exist
```

Log from both commands:

```
Resetting corrupted state database...
```

Every invocation detected "corruption" and reset.

### Why it happens

The initialization code always called `Git.init()`:

```clojure
(defn create-storage [path]
  (-> (Git/init)
      (.setDirectory (io/file path))
      (.call)
      (.getRepository)))
```

`Git.init()` internally calls `repository.create()`, which rewrites `HEAD` to point to an empty branch. Even if the repository exists with data.

**Each process:** init → empty HEAD → "where's my data?".

### The solution

Check before creating:

```clojure
(defn repository-exists? [path]
  (let [git-dir (io/file path ".git")]
    (and (.exists git-dir)
         (.isDirectory git-dir)
         (.exists (io/file git-dir "HEAD"))
         (.isDirectory (io/file git-dir "objects")))))

(defn lib-open [data-path index-path]
  (let [storage (if (repository-exists? data-path)
                  (open-existing-repository data-path)
                  (create-new-repository data-path))
        ...]
    ...))
```

Seems obvious in retrospect. But when you're focused on making it work, it's easy to treat "open" and "create" as the same operation.

## Problem 4: Multiple Instances Corrupt Data

Fourth issue. User's code:

```rust
fn process_a() {
    let db = ChronDB::open("/data", "/index")?;
    db.put("key", value)?;
}

fn process_b() {
    let db = ChronDB::open("/data", "/index")?;  // Same path!
    let v = db.get("key")?;  // Sometimes works, sometimes doesn't
}
```

### Why it happens

Each `open()` created a new worker thread, a new GraalVM Isolate, a new JGit Repository instance and Lucene IndexWriter.

OS advisory locks work **between processes**, not between threads in the same process accessing via different handles. Two Isolates in the same process can open the same files — and start overwriting each other's data.

### The solution

Singleton per path. One instance per (data_path, index_path) combination:

```rust
lazy_static! {
    static ref REGISTRY: Mutex<HashMap<PathPair, Weak<SharedWorker>>> =
        Mutex::new(HashMap::new());
}

impl ChronDB {
    pub fn open(data_path: &str, index_path: &str) -> Result<Self> {
        let key = PathPair::new(data_path, index_path);
        let mut registry = REGISTRY.lock().unwrap();

        // Reuse if exists
        if let Some(weak) = registry.get(&key) {
            if let Some(worker) = weak.upgrade() {
                return Ok(Self { worker });
            }
        }

        // Create new
        let worker = Arc::new(SharedWorker::new(data_path, index_path)?);
        registry.insert(key, Arc::downgrade(&worker));
        Ok(Self { worker })
    }
}
```

`Weak` in the registry allows the worker to be dropped when nobody uses it anymore. Next `open()` on the same path creates a new worker.

## What I Learned

### GraalVM native-image isn't "compile to native"

The first illusion that broke: native-image doesn't eliminate the runtime, it just embeds it. SubstrateVM is there — with GC, thread management, stack guards, safepoints. Everything the JVM does, SubstrateVM does too, just ahead-of-time instead of JIT.

This means you're not distributing "pure native code". You're distributing a minimalist VM with your code pre-compiled inside. And that VM has requirements: needs heap, needs stack, needs to register threads, needs space for stack traces.

When I read that SubstrateVM allocates space for a complete stack trace at every `@CEntryPoint` entry point, I understood why 8MB wasn't enough. It's not that our code is inefficient — it's that the runtime needs to be prepared to capture hundreds of frames if something goes wrong. With Clojure (which adds var resolution frames), JGit (Git operations are deep), and Lucene (indexing has many layers), the potential stack trace is enormous.

The lesson: **understand the runtime you're distributing**. Reading the [SubstrateVM documentation](https://docs.oracle.com/en/graalvm/enterprise/20/docs/reference-manual/native-image/SubstrateVM/) about Isolates, stack guards, and thread attachment changed how I think about the problem.

### Bindings aren't the API — they're a protection layer

The initial temptation was to make "thin" bindings: translate the exported C functions 1:1 to Rust idioms. `ChronDB_open` becomes `ffi::open()`, `ChronDB_put` becomes `ffi::put()`. Simple.

This approach transfers **all runtime requirements** to the user. Need 64MB of stack? User's problem to configure. Orphaned lock? User's problem to clean up. Multiple instances? User's problem to coordinate.

What worked was inverting the mindset: **bindings are a protection layer between the native runtime and user code**.

```
┌─────────────────────────────────────────────┐
│           User code                         │
│  db.put("key", value)  // Simple API        │
├─────────────────────────────────────────────┤
│          Protection layer                   │
│  - Worker thread with adequate stack        │
│  - Singleton per path                       │
│  - Orphaned lock cleanup                    │
│  - Create vs open verification              │
│  - Errors with context                      │
├─────────────────────────────────────────────┤
│     FFI calls (controlled environment)      │
├─────────────────────────────────────────────┤
│         libchrondb.so                       │
└─────────────────────────────────────────────┘
```

The user never calls FFI directly. Every call goes through the layer that ensures the conditions necessary for the runtime to work. Worker thread solves stack. Singleton solves concurrency. Cleanup solves previous crashes.

### Documentation is not a solution

**"Configure `RUST_MIN_STACK=64MB` before using"** seems reasonable. It's not.

First, because **it doesn't work** — that env var only affects threads created afterward, not the main thread. Second, because even if it worked, **nobody reads runtime requirements documentation**. People install the crate, call `open()`, and expect it to work.

Third — and most importantly — because **if you need to document an environment requirement, you haven't finished the work**. The lib should create that environment internally.

This was the most important mindset shift: every documented requirement is a design failure. If the runtime needs 64MB of stack, the lib creates a thread with 64MB. If the runtime leaves orphaned locks, the lib cleans up before opening. If multiple instances corrupt data, the lib ensures singleton.

The work doesn't end when the function executes. It ends when the user doesn't need to know anything about the runtime to use the lib.

### FFI is translation between worlds with different physics

Rust has ownership, lifetimes, RAII. Clojure has GC, immutability, vars. GraalVM has Isolates, safepoints, compressed references. Each world has its rules about what happens when:

- An object goes out of scope
- A thread terminates
- A process crashes
- Memory runs out

FFI isn't "calling a function from another language". It's **translating between worlds with different physical rules**. The `long handle` that Clojure returns is an index in an internal table — if the GC moves the object, the handle remains valid. But if the Isolate is destroyed, all handles become invalid instantly.

Understanding this changes how you design the boundary. You don't think "which function to expose?". You think "which invariants of my world do I need to protect? which invariants of the other world do I need to respect?".

In our case:

- **Protect from Clojure side**: handles are only valid while the Isolate exists; GC can pause at safepoints; IO operations can block
- **Respect from Rust side**: ownership needs to be clear; errors need to be Result, not exceptions; resources need to be released in Drop

### The real cost of FFI with GraalVM

After solving the problems, I calculated what the protection layer adds:

- **Latency**: ~50-100μs per operation (channel send/recv + context switch to worker)
- **Memory**: ~64MB for worker stack + channel overhead
- **Complexity**: ~500 lines of infrastructure code in bindings

For a database where operations are IO-bound (Git write, Lucene index), 100μs is noise. 64MB is acceptable for any modern machine. 500 lines is the cost of not having to explain to every user how to configure stack size.

**The tradeoff was worth it!** But it's important to know it exists. "Transparent" FFI doesn't exist — either you pay the cost in the lib, or the user pays in bugs and configuration.

## Links

- [ChronDB](https://github.com/moclojer/chrondb)
- [PR #89 - Worker thread architecture](https://github.com/moclojer/chrondb/pull/89)
- [PR #93 - Fix repository-exists](https://github.com/moclojer/chrondb/pull/93)
- [PR #95 - Singleton pattern](https://github.com/moclojer/chrondb/pull/95)

If you're exposing a lib via FFI, I hope this battle documentation is useful. The problems are predictable — after you encounter them for the first time.

It wasn't as simple as I thought it would be. I thought I'd just turn ChronDB into a `.so` and with a simple layer in the native language (e.g., Rust) I'd have ChronDB native in that language.
