---
date: "2026-01-25"
title: "jbundle vs jpackage: What's the Difference?"
description: "Understanding when to use jbundle vs Java's built-in packaging tool"
tags: ["jvm", "java", "jbundle", "jpackage", "packaging"]
link: "https://github.com/avelino/jbundle"
comment: false
---

They solve different problems.

## jpackage: Distribution via Installers

**jpackage** is a distribution tool included in JDK 14+. It creates platform-specific installers:

- Windows: `.exe`, `.msi`
- macOS: `.dmg`, `.pkg`
- Linux: `.deb`, `.rpm`

The workflow is traditional: user downloads installer → runs installer → application is installed in system directories → user launches from Start Menu/Applications/etc.

jpackage bundles a full JVM runtime, but that's where optimization ends. No startup improvements, no runtime tuning. It's essentially "take your JAR, wrap it with a JVM, generate an installer."

**Best for:** Desktop applications where users expect a traditional installation experience.

## [jbundle](https://github.com/avelino/jbundle): Native-Feeling Binaries

**[jbundle](https://github.com/avelino/jbundle)** creates a single executable binary. The workflow mirrors Go or Rust:

```
Download → chmod +x → Run
```

No installer. No installation step. No system directories. The binary is self-contained — move it anywhere, copy to a server, distribute via curl. It just works.

### Why Startup Time Matters

The JVM is notorious for slow startup. A simple "hello world" can take 500ms+. For CLI tools or short-lived processes, this is unacceptable.

jbundle attacks this problem from multiple angles:

**1. Minimal Runtime (jlink)**

Instead of bundling the full JDK (~300MB), jbundle uses `jdeps` to detect which modules your application actually uses, then `jlink` to create a minimal runtime (~30-50MB). Less code to load = faster startup.

**2. AppCDS (Class Data Sharing)**

On first run, the JVM generates a shared archive (`.jsa`) containing pre-parsed, pre-verified class metadata. Subsequent runs load this cache directly, skipping expensive parsing and verification. This alone cuts startup by 60-75%.

**3. Profile-Specific JVM Flags**

The `--profile cli` option configures the JVM for short-lived processes:
- Tiered compilation with C1 only (skip C2 optimization)
- SerialGC (simpler, faster startup than G1)
- Reduced code cache

Result: ~200-350ms startup for CLI tools.

**4. CRaC (Coordinated Restore at Checkpoint)**

The nuclear option. On supported JDKs (Azul Zulu with CRaC), jbundle can create a checkpoint of your warmed-up application. Subsequent runs restore from checkpoint in 10-50ms — essentially native binary territory.

## The Real Difference

| Aspect | jbundle | jpackage |
|--------|---------|----------|
| **Output** | Single executable binary | Platform installers |
| **User experience** | Download → run | Download → install → run |
| **JVM size** | Minimal (~30-50MB via jlink) | Full JDK (~300MB) |
| **Startup optimization** | AppCDS, CRaC, profiles | None |
| **Distribution** | curl, cp, scp — like Go/Rust | App stores, package managers |
| **Use case** | CLI tools, microservices, serverless | Desktop apps with GUI |

## Why Not GraalVM native-image?

GraalVM compiles JVM bytecode to native code ahead-of-time. Startup is instant (~10-50ms), binaries are small (~20-40MB). Sounds perfect, right?

The catch: not everything works. GraalVM uses closed-world analysis — it needs to know every class at compile time. This breaks:

- Reflection (requires manual configuration)
- Dynamic proxies
- Many popular libraries (especially older ones)
- Runtime code generation

You'll spend hours writing `reflect-config.json`, debugging mysterious `ClassNotFoundException`s, and discovering that library X doesn't support native-image.

jbundle takes a different approach: keep the full JVM, optimize startup through caching and profiles. Everything that works on the JVM works with jbundle. No configuration. No compatibility matrix. No surprises.

## When to Use What

**Use jpackage when:**
- Building desktop applications with GUIs
- Users expect traditional installation (Start Menu, Applications folder)
- You need system integration (file associations, shortcuts)

**Use jbundle when:**
- Building CLI tools
- Building microservices or serverless functions
- You want Go/Rust-style distribution
- Startup time matters
- You're tired of GraalVM compatibility issues

**Use GraalVM native-image when:**
- You need absolute minimum startup time
- Your dependencies are native-image compatible
- You have time to maintain reflection configs

## tl;dr

- **jpackage** = installers for desktop apps
- **jbundle** = native-feeling binaries with optimized startup
- **GraalVM** = true native compilation (when it works)

I built [jbundle](https://github.com/avelino/jbundle) because I wanted the distribution simplicity of Go with full JVM compatibility. No compromises.

---

**Ready to try it?** Check out the [full documentation](/projects/jbundle/) for installation instructions, usage examples, and advanced configuration.
