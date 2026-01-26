---
date: "2026-01-25"
title: "jbundle"
tags: ["jvm", "bin", "java", "clojure", "kotlin", "scala", "groovy", "package", "graalvm", "rust"]
link: "https://github.com/avelino/jbundle"
comment: false
---

Package JVM applications into self-contained binaries. No JVM installation required to run the output.

**[jbundle](https://github.com/avelino/jbundle)** transforms JVM applications (Clojure, Java, Kotlin, Scala, Groovy) into self-contained binaries. Previously known as `clj-pack`, the tool was renamed to reflect support for all JVM languages.

## Motivation

The conventional deployment approach requires both the JAR and a JVM on the target machine. GraalVM native-image is an alternative, but presents challenges: slow compilations, complex reflection configuration, and library incompatibilities.

jbundle offers a practical solution: bundles a minimal JVM runtime with your uberjar into a single executable. The result is a single file, no external dependencies, with full JVM compatibility.

## Comparison: jbundle vs GraalVM native-image

| Aspect | jbundle | GraalVM |
|--------|---------|---------|
| **Compatibility** | 100% JVM compatible | Requires reflection config, incompatible libs |
| **Build time** | Fast (jlink + packaging) | Slow (ahead-of-time compilation) |
| **Binary size** | ~30-50 MB | ~20-40 MB |
| **Startup (warmed)** | ~200-350ms (AppCDS) / ~10-50ms (CRaC) | ~10-50ms |
| **First run** | Extract + generate CDS (~2-5s), then cached | Instant |
| **Setup** | Just `jbundle` | GraalVM + native-image + config |
| **Debug** | Standard JVM tools | Limited |

## Quick Start

```bash
# Build from Clojure project (deps.edn or project.clj)
jbundle build --input ./my-clojure-app --output ./dist/my-app

# Build from Java project (pom.xml or build.gradle)
jbundle build --input ./my-java-app --output ./dist/my-app

# Build from pre-compiled JAR
jbundle build --input ./target/app.jar --output ./dist/my-app

# Run (no Java required on system)
./dist/my-app
```

## How It Works

The process follows seven steps:

1. Detects build system (deps.edn, project.clj, pom.xml, build.gradle)
2. Builds JAR (clojure/lein/mvn/gradle)
3. Downloads JDK from Adoptium (cached locally)
4. Detects modules with jdeps
5. Creates minimal runtime with jlink (~30-50 MB)
6. Creates CRaC checkpoint for instant restore (optional, Linux only)
7. Packages into multi-layer binary (runtime + compressed app.jar)

The multi-layer format is: `[stub] [runtime.tar.gz] [app.jar.gz] [crac.tar.gz?]`. Each layer is cached independently by content hash in `~/.jbundle/cache/`.

## Build Error Diagnostics

When a build fails, jbundle displays structured diagnostics with source context, similar to `rustc`:

```
error: Unable to resolve symbol: prntln
 --> src/example/core.clj:9:5
   |
 7 | (defn process-data [data]
 8 |   (let [result (map inc data)]
 9 |     (prntln "Processing:" result)
   |     ^^^^^^^ symbol not found
10 |     (reduce + result)))
```

Supported for all build systems. Returns raw output if format is not recognized.

## Startup Performance

jbundle aims for GraalVM-level startup times without AOT compilation, using native HotSpot techniques.

### First Run vs Subsequent Runs

| Metric | First run | Subsequent runs |
|--------|-----------|-----------------|
| **What happens** | Extract runtime + app, JVM generates AppCDS | Everything cached, JVM loads pre-processed metadata |
| **Overhead** | +2-5s (extraction + CDS) | None |
| **Startup (cli profile)** | ~800-1500ms | ~200-350ms (~60-75% faster) |
| **Startup (server profile)** | ~1000-2000ms | ~400-600ms (~50-70% faster) |
| **Startup (CRaC restore)** | ~800-1500ms | ~10-50ms (~95% faster) |

**Why first run is slower:** The JVM needs to extract compressed layers, then uses `-XX:+AutoCreateSharedArchive` to generate a shared archive (`.jsa`). This is a one-time cost—the file is cached.

**Why subsequent runs are faster:** The JVM loads pre-processed metadata from the `.jsa` file, skipping parsing, verification, and class layout. Combined with profile-specific flags, overhead is minimized.

### JVM Profiles

The `--profile` flag selects optimized JVM flags:

- **`server`** (default): No extra flags, standard HotSpot behavior. Best for long-running services.
- **`cli`**: Tiered compilation with C1 only + SerialGC. Optimized for CLI tools (~200-350ms startup after first run).

### AppCDS (Class Data Sharing)

Enabled by default (JDK 19+). On first run, the JVM automatically generates a shared archive (`.jsa`) with pre-processed metadata. Subsequent runs load this file, skipping parsing.

Stored in `~/.jbundle/cache/app-<hash>/app.jsa`, bound to the specific app version. Disable with `--no-appcds` if you observe issues.

### CRaC (Coordinated Restore at Checkpoint)

Optional (`--crac`). On supported JDKs, jbundle creates a checkpoint of the app after warmup. Subsequent runs restore from checkpoint—~10-50ms startup, comparable to native binaries.

Requires JDK with CRaC (e.g., Azul Zulu with CRaC). Falls back to AppCDS + profile flags if restore fails. Linux only.

### Layered Cache

The binary has independent layers, each cached by hash:

```
~/.jbundle/cache/
  rt-<hash>/        # JVM runtime (reused across rebuilds)
  app-<hash>/       # app.jar + app.jsa (generated on first run)
  crac-<hash>/      # CRaC checkpoint (if enabled)
```

Changing only application code doesn't re-extract the runtime—relevant for CI/CD and containers.

## Installation

### From Source

```bash
git clone https://github.com/avelino/jbundle.git
cd jbundle
cargo install --path .
```

## Usage

### Command Line Examples

```bash
# Build with specific Java version
jbundle build --input . --output ./dist/app --java-version 21

# Cross-platform target
jbundle build --input . --output ./dist/app --target linux-x64

# Pass JVM arguments
jbundle build --input . --output ./dist/app --jvm-args "-Xmx512m"

# CLI profile (fast startup)
jbundle build --input . --output ./dist/app --profile cli

# Disable AppCDS
jbundle build --input . --output ./dist/app --no-appcds

# Enable CRaC (Linux, requires supported JDK)
jbundle build --input . --output ./dist/app --crac

# Cache info
jbundle info

# Clean cache
jbundle clean
```

### Configuration File

Create `jbundle.toml` in your project to avoid repeating flags:

```toml
# jbundle.toml
java_version = 21
target = "linux-x64"
shrink = true
jvm_args = ["-Xmx512m", "-XX:+UseZGC"]
profile = "cli"          # "cli" or "server" (default: "server")
appcds = true            # generate AppCDS (default: true)
crac = false             # enable CRaC (default: false)
```

All fields are optional. Precedence is: **CLI flags > jbundle.toml > internal defaults**.

## Supported JDK Versions

jbundle downloads runtimes from Adoptium. Accepted versions:

| Version | Type | Status |
|---------|------|--------|
| `11` | LTS | Supported |
| `17` | LTS | Supported |
| `21` | **LTS** | **Default** |
| `22` | STS | Supported |
| `23` | STS | Supported |
| `24` | STS | Supported |
| `25` | LTS | Supported |

LTS versions are recommended for production. Default is `21` when not specified.

**Note:** Java 8 is not supported—jbundle requires `jlink` and `jdeps` (introduced in Java 9).

## Supported Platforms

| Target | Status |
|--------|--------|
| `linux-x64` | Supported |
| `linux-aarch64` | Supported |
| `macos-x64` | Supported |
| `macos-aarch64` | Supported |

## Supported Build Systems

| System | Detection |
|--------|-----------|
| deps.edn (tools.build) | `deps.edn` in root |
| Leiningen | `project.clj` in root |
| Maven | `pom.xml` in root |
| Gradle | `build.gradle(.kts)` in root |

## Contributing

Contributions are welcome. Process:

1. Fork the repository
2. Create branch for your change
3. Make changes with tests (if applicable)
4. Open pull request

### Development

```bash
# Build
cargo build

# Run against example projects
cargo run -- build --input ./example/clojure-deps --output ./dist/app
cargo run -- build --input ./example/clojure-lein --output ./dist/app
cargo run -- build --input ./example/java-pom --output ./dist/app
cargo run -- build --input ./example/java-gradle --output ./dist/app

# After installing
jbundle build --input ./example/clojure-deps --output ./dist/app

# Run generated binary
./dist/app
```

### Contribution Ideas

- Windows support
- Customizable `jlink` module list override
- Compression options (zstd, xz)
- CI/CD examples
- Homebrew formula

## License

MIT
