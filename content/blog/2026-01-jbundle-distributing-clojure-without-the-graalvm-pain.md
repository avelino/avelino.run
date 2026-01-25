---
title: "jbundle: Distributing Clojure Without the GraalVM Pain"
date: 2026-01-23
draft: false
description: "How frustration with GraalVM native-image led to a Rust tool that packages Clojure apps into self-contained binaries — by embedding a minimal JVM instead of fighting reflection configs."
tags: ["clojure", "rust", "graalvm", "cli", "engineering"]
url: "/jbundle-distributing-clojure-without-the-graalvm-pain"
aliases:
  - "/clj-pack-distributing-clojure-without-the-graalvm-pain"
---

If you've ever tried to ship a Clojure CLI tool as a single binary, you know the pain. GraalVM native-image promises native compilation, but the reality is a maze of build-time class initialization, reflection configs, and incompatible libraries. After years of fighting this battle with [chrondb](https://github.com/moclojer/chrondb) and [moclojer](https://github.com/moclojer/moclojer), I built [jbundle](https://github.com/avelino/jbundle) — a different approach entirely.

## The GraalVM native-image tax

Coming from Go, where `go build` gives you a static binary in seconds, moving to Clojure for CLI tools felt like a regression in distribution. GraalVM native-image exists, but using it seriously means paying an ongoing tax.

Here's what a real native-image setup looks like. This is from chrondb's `native_image.clj`:

```clojure
(def base-build-time-classes
  ["org.apache.lucene.analysis.standard.StandardAnalyzer"
   "org.apache.lucene.store.FSDirectory"
   "org.eclipse.jetty.server.Server"
   "org.eclipse.jetty.servlet.ServletContextHandler"
   ;; ... dozens more classes
   "clojure.asm.ClassVisitor"
   "clojure.lang.Compiler"])

(def base-run-time-classes
  ["org.eclipse.jgit.util.FileUtils"
   "com.fasterxml.jackson.core.JsonFactory"
   ;; more classes that break if initialized at build-time
   ])
```

Every dependency you add potentially requires you to figure out which of its classes must be initialized at build-time vs runtime. Get it wrong, and you get cryptic errors at compile time or, worse, at runtime. The `clj-easy/graal-build-time` project helps, but you still end up maintaining a handcrafted list of class configurations that grows with every dependency.

Both chrondb and moclojer generate their native-image arguments programmatically — a Clojure namespace that outputs `reflect-config.json`, `resource-config.json`, and a `native-image-args` file with flags like `--initialize-at-build-time`, `--initialize-at-run-time`, `--no-fallback`, and platform-specific linker options. The moclojer CI even runs a tracing agent to discover reflection usage dynamically. All of this just to get a binary.

The fundamental problem: GraalVM native-image requires you to know your application's runtime behavior at compile time. For a dynamic language like Clojure, that's inherently adversarial.

## A different bet: embed the runtime

jbundle takes the opposite approach. Instead of eliminating the JVM, it includes a minimal one. The key insight is that `jlink` (available since JDK 9) can produce a custom JVM runtime containing only the modules your application actually uses. A typical Clojure CLI app needs `java.base`, `java.logging`, maybe `java.sql` — resulting in a runtime of ~30-50 MB instead of the full ~300 MB JDK.

The final binary is a single executable file. No JVM installation required on the target machine. No `.jar` files to manage. Just `./my-app` and it runs.

## Opening the hood

jbundle's pipeline has five stages:

```
Source Project → Uberjar → JDK (cached) → jlink runtime → Single Binary
```

**Stage 1: Build the uberjar.** jbundle detects your build system automatically. If it finds `deps.edn` with a `build.clj`, it runs `clojure -T:build uber`. If it finds `project.clj`, it runs `lein uberjar`. You can also pass a pre-built `.jar` directly.

**Stage 2: Ensure a JDK is available.** jbundle queries the [Adoptium API](https://api.adoptium.net/v3) to download a JDK matching your target platform. Downloads are cached in `~/.jbundle/cache/jdk-{version}-{os}-{arch}` and verified via SHA256.

**Stage 3: Detect required Java modules.** It runs `jdeps --print-module-deps` on your uberjar to discover which Java modules are actually referenced. If jdeps fails (common with complex JARs), it falls back to a sensible default set.

**Stage 4: Create a minimal runtime.** Using `jlink` with the detected modules, it produces a stripped-down JVM:

```
jlink --module-path jmods \
      --add-modules java.base,java.logging,java.sql \
      --strip-debug \
      --no-man-pages \
      --no-header-files \
      --compress=zip-6 \
      --output runtime/
```

**Stage 5: Pack everything into one file.** This is where it gets interesting. The final binary is a concatenation of two parts:

```
[shell stub script] + [payload.tar.gz]
```

The stub is a generated shell script that:

1. Computes a hash of the payload for caching.
2. On first run, extracts the payload to `~/.jbundle/cache/{hash}/`.
3. On subsequent runs, uses the cached extraction directly.
4. Executes `runtime/bin/java -jar app.jar` with the embedded runtime.

The `tail -c $PAYLOAD_SIZE` trick in the stub extracts exactly the payload bytes from the end of the file. This is the same technique used by tools like `makeself` — a proven pattern for self-extracting archives.

## Why Rust?

This might seem contradictory: a tool for Clojure developers, written in Rust. The reasoning is pragmatic:

**The tool itself needs to be a single binary.** If jbundle required a JVM to run, we'd have a chicken-and-egg problem. You'd need Java installed to build the thing that removes the Java requirement. Rust gives us a zero-dependency static binary out of `cargo build --release`.

**The problem domain is systems programming.** jbundle manipulates archives, downloads files with integrity verification, manages caches, detects platform-specific paths, and orchestrates external processes (`jdeps`, `jlink`, `clojure`). This is exactly what Rust excels at — I/O-heavy orchestration with strong guarantees.

**Error handling matters here.** A packaging tool that silently produces broken binaries is worse than useless. Rust's type system (with `thiserror` for domain errors and `anyhow` for the main function) makes it hard to forget error paths. Every fallible operation is explicit in the code.

**Cross-compilation is trivial.** Supporting linux-x64, linux-aarch64, macos-x64, and macos-aarch64 from a single codebase with `cargo build --target` is something Rust handles out of the box.

The Rust ecosystem also provided exactly the right tools: `clap` for CLI parsing, `reqwest` for async HTTP, `tar`/`flate2`/`zip` for archive manipulation, `indicatif` for progress bars, and `tokio` for async I/O. The entire tool compiles in seconds and produces a ~10 MB binary.

## The trade-off

jbundle doesn't produce native code. Your application still runs on the JVM, with JVM startup time and memory characteristics. The binaries are larger than what GraalVM native-image would produce (~50-80 MB vs ~20-40 MB for a typical CLI app).

But you gain something valuable: **it works with every Clojure library, every time.** No reflection configs. No build-time vs runtime class initialization. No incompatible dependencies. No multi-minute native compilation. No tracing agents. If your app runs on `java -jar`, jbundle can package it.

For CLI tools where startup time is critical (sub-100ms), GraalVM native-image is still the right choice — if you're willing to pay the maintenance cost. For everything else — services, tools where a 1-2 second startup is acceptable, applications with complex dependency trees — jbundle removes an entire category of build infrastructure.

## The real lesson

Sometimes the best solution isn't the technically purest one. GraalVM native-image is impressive engineering, but it fights against Clojure's dynamic nature. jbundle accepts the JVM for what it is and focuses on the actual user problem: distribution. One command, one binary, runs anywhere. That's the Go developer experience I was missing, adapted to Clojure's reality.

---

> **Note:** Previously known as clj-pack. Renamed to jbundle to reflect support for all JVM languages, not just Clojure.
