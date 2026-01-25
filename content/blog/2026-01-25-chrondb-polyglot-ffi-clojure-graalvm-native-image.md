---
date: "2026-01-25"
title: "ChronDB: Transforming a Clojure Database into a Polyglot Library with GraalVM Native Image and FFI"
tags: ["chrondb", "clojure", "graalvm", "ffi", "rust", "python", "native-image", "shared-library", "open-source", "database"]
description: "A deep dive into how ChronDB leverages GraalVM Native Image to compile Clojure code into native shared libraries (.so/.dylib), enabling seamless FFI integration with Rust and Python through ctypes and bindgen."
url: "/chrondb-polyglot-ffi-clojure-graalvm-native-image"
---

[ChronDB](https://github.com/moclojer/chrondb) was born as a **server**. A time-traveling key/value database with Git as its storage engine, exposing PostgreSQL wire protocol, Redis protocol, and REST/HTTP. You'd download the server, run it, connect with your favorite client. Classic architecture.

Then I started building [spuff](https://github.com/avelino/spuff) — ephemeral dev environments in the cloud. Spin up when needed, auto-destroy when forgotten. Written in Rust. For state management, I reached for SQLite. Simple, embedded, no server to manage. Just a file.

But something kept nagging at me: **why SQLite?**

The state I was storing was simple. Key-value pairs. Configuration. Session data. Nothing that truly needed SQL. And I already had a database designed exactly for this use case — ChronDB. Time-travel for debugging. Git-native storage for versioning. Perfect fit.

Except for one problem: ChronDB was a server written in Clojure. My CLI was in Rust. I didn't want to force users to run a JVM process just to store some ephemeral state.

The question became: **how do I embed ChronDB directly into a Rust binary?**

I remembered solving a similar problem before. When building the [prestd plugin system](https://docs.prestd.com/plugins), we needed to expose Go code to other languages. The solution was compiling to a shared library and using FFI. Could the same approach work for Clojure?

The answer was **GraalVM Native Image** — and what started as a hack to avoid SQLite became an architecture that now lets ChronDB run embedded in Rust, Python, or any language that can load a `.so` file.

## The Architecture at a Glance

The system is organized in five layers, from top (user-facing) to bottom (core):

1. **Language Bindings** (Rust, Python) — Safe wrappers, JSON parsing, resource management
2. **C API** (libchrondb.so/dylib) — `@CEntryPoint` functions via GraalVM native-image `--shared`
3. **Java Bridge** (ChronDBLib.java) — Lazy-loads Clojure, converts C ↔ Java types
4. **Clojure Bridge** (chrondb.lib.core) — Handle registry, orchestrates Storage + Index
5. **ChronDB Core** — GitStorage + LuceneIndex

Each layer has a specific responsibility, creating clean separation of concerns while maintaining the ability to cross language boundaries efficiently.

## Layer 1: The Clojure Core and Handle Registry

At the foundation, we have pure Clojure code managing database connections. The key insight here is the **handle registry pattern** - a thread-safe mapping between integer handles and database instances:

```clojure
(defonce ^:private ^AtomicInteger handle-counter (AtomicInteger. 0))
(defonce ^:private handle-registry (atom {}))

(defn lib-open [data-path index-path]
  (try
    (let [storage (git/create-git-storage data-path)
          idx (lucene/create-lucene-index index-path)]
      (when (and storage idx)
        (lucene/ensure-index-populated idx storage nil {:async? false})
        (let [handle (.getAndIncrement ^AtomicInteger handle-counter)]
          (swap! handle-registry assoc handle {:storage storage :index idx})
          handle)))
    (catch Throwable _e -1)))
```

Why integers instead of pointers? Because **integers cross the FFI boundary cleanly**. An `int` is the same in C, Rust, Python, and Java. No pointer gymnastics, no memory layout concerns. The actual objects stay safely inside the JVM/native image, referenced only by their integer handle.

This pattern is documented extensively in "Foreign Function Interface in Modern Programming" and follows the classic **opaque handle** design that Win32 APIs popularized decades ago.

## Layer 2: The Java Bridge with @CEntryPoint

GraalVM Native Image requires a Java layer to define C-callable entry points. Each function is annotated with `@CEntryPoint`, which tells the native-image compiler to export this function with C ABI:

```java
@CEntryPoint(name = "chrondb_open")
public static int open(IsolateThread thread,
                       CCharPointer dataPath,
                       CCharPointer indexPath) {
    try {
        ensureInitialized();
        String dp = toJavaString(dataPath);
        String ip = toJavaString(indexPath);
        Object result = libOpen.invoke(dp, ip);
        if (result instanceof Number) {
            return ((Number) result).intValue();
        }
        lastError = "open returned non-numeric result";
        return -1;
    } catch (Exception e) {
        lastError = e.getClass().getName() + ": " + e.getMessage();
        return -1;
    }
}
```

Notice several critical design decisions:

1. **Lazy Clojure initialization**: `ensureInitialized()` loads Clojure runtime only on first call
2. **Type conversion**: `CCharPointer` <-> `String` using GraalVM's `CTypeConversion`
3. **Error handling**: Exceptions never cross FFI boundaries - we store errors in `lastError` and return sentinel values (`-1`)
4. **IsolateThread parameter**: GraalVM requires an isolate thread context for all entry points

The `ensureInitialized()` method demonstrates lazy loading of Clojure namespaces:

```java
private static synchronized void ensureInitialized() {
    if (!initialized) {
        IFn require = Clojure.var("clojure.core", "require");
        require.invoke(Clojure.read("chrondb.lib.core"));

        libOpen = Clojure.var("chrondb.lib.core", "lib-open");
        libClose = Clojure.var("chrondb.lib.core", "lib-close");
        libPut = Clojure.var("chrondb.lib.core", "lib-put");
        // ... more function references

        initialized = true;
    }
}
```

This is the **IFn pattern** - storing references to Clojure functions as `IFn` objects that can be invoked from Java. It's the standard way to call Clojure from Java, and it works perfectly inside native images.

## Layer 3: Building the Shared Library

The build process has three distinct phases, orchestrated by `shared_library.clj`:

### Phase 1: Uberjar Creation

```clojure
(build/-main "--uberjar")
```

Creates a single JAR containing all dependencies - the Clojure runtime, JGit, Lucene, and ChronDB itself.

### Phase 2: Java Compilation with SVM Classpath

```clojure
(defn- compile-java! [graalvm-home]
  (let [svm-jars (find-svm-jars graalvm-home)
        uberjar-path (.getAbsolutePath (io/file build/jar-file))
        classpath (string/join ":" (concat svm-jars [uberjar-path]))]
    (shell/sh "javac"
              "-cp" classpath
              "-d" "target/shared-classes"
              "-source" "11" "-target" "11"
              "java/chrondb/lib/ChronDBLib.java")))
```

The key here is adding GraalVM's SVM (Substrate VM) JARs to the classpath. These provide the `@CEntryPoint` annotations and `CTypeConversion` utilities.

### Phase 3: Native Image Arguments

```clojure
(let [shared-args (concat ["--shared"
                           "-H:Name=libchrondb"
                           (str "-H:Path=" target-path)]
                          processed)]
  (spit shared-args-file (string/join "\n" shared-args)))
```

The `--shared` flag is the magic switch that tells native-image to produce a shared library instead of an executable. The output includes:

- `libchrondb.so` (Linux) / `libchrondb.dylib` (macOS) - the shared library
- `libchrondb.h` - C header with function declarations
- `graal_isolate.h` - GraalVM isolate management types

## Layer 4: Python Bindings with ctypes

Python's `ctypes` module provides direct access to C shared libraries. Our FFI layer configures function signatures:

```python
def load_library():
    lib = ctypes.CDLL(lib_path)

    # GraalVM Isolate Management
    lib.graal_create_isolate.argtypes = [c_void_p, POINTER(c_void_p), POINTER(c_void_p)]
    lib.graal_create_isolate.restype = c_int

    # ChronDB Functions
    lib.chrondb_open.argtypes = [c_void_p, c_char_p, c_char_p]
    lib.chrondb_open.restype = c_int

    lib.chrondb_put.argtypes = [c_void_p, c_int, c_char_p, c_char_p, c_char_p]
    lib.chrondb_put.restype = c_char_p

    return lib
```

The safe wrapper class manages the GraalVM isolate lifecycle:

```python
class ChronDB:
    def __init__(self, data_path: str, index_path: str):
        self._lib = load_library()
        self._isolate = c_void_p()
        self._thread = c_void_p()

        ret = self._lib.graal_create_isolate(
            None, byref(self._isolate), byref(self._thread)
        )
        if ret != 0:
            raise ChronDBError("Failed to create GraalVM isolate")

        self._handle = self._lib.chrondb_open(
            self._thread,
            data_path.encode('utf-8'),
            index_path.encode('utf-8')
        )

    def put(self, id: str, doc: dict, branch: str = None) -> dict:
        json_str = json.dumps(doc).encode('utf-8')
        result = self._lib.chrondb_put(
            self._thread,
            self._handle,
            id.encode('utf-8'),
            json_str,
            branch.encode('utf-8') if branch else None
        )
        return json.loads(result.decode('utf-8'))
```

Key Python FFI considerations:

1. **String encoding**: Always encode to UTF-8 bytes before passing to C
2. **Memory management**: GraalVM manages the returned strings; Python's ctypes handles the conversion
3. **Context managers**: Implement `__enter__`/`__exit__` for safe cleanup
4. **Library discovery**: Search multiple paths (env vars, `~/.chrondb/lib/`, system paths)

## Layer 5: Rust Bindings with bindgen

Rust's approach is more compile-time focused. The `build.rs` script uses `bindgen` to generate Rust FFI declarations from C headers:

```rust
let bindings = bindgen::Builder::default()
    .header(header_path.to_str().unwrap())
    .clang_arg(format!("-I{}", lib_dir.display()))
    .allowlist_function("chrondb_.*")
    .allowlist_function("graal_create_isolate")
    .allowlist_function("graal_tear_down_isolate")
    .allowlist_type("graal_isolate_t")
    .allowlist_type("graal_isolatethread_t")
    .generate()
    .expect("Unable to generate bindings");
```

The generated bindings are included at compile time:

```rust
// ffi.rs
include!(concat!(env!("OUT_DIR"), "/bindings.rs"));
```

The safe Rust wrapper emphasizes ownership and RAII:

```rust
pub struct ChronDB {
    isolate: *mut ffi::graal_isolate_t,
    thread: *mut ffi::graal_isolatethread_t,
    handle: i32,
}

unsafe impl Send for ChronDB {}

impl Drop for ChronDB {
    fn drop(&mut self) {
        if self.handle >= 0 {
            unsafe { ffi::chrondb_close(self.thread, self.handle); }
            self.handle = -1;
        }
        if !self.thread.is_null() {
            unsafe { ffi::graal_tear_down_isolate(self.thread); }
            self.thread = ptr::null_mut();
            self.isolate = ptr::null_mut();
        }
    }
}
```

The `Drop` implementation ensures cleanup happens automatically. No `try`/`finally` needed - Rust's ownership system guarantees `drop` runs when the `ChronDB` instance goes out of scope.

Type-safe operation methods use `CString` and `serde_json`:

```rust
pub fn put(&self, id: &str, doc: &serde_json::Value, branch: Option<&str>) -> Result<serde_json::Value> {
    let c_id = CString::new(id)?;
    let json_str = serde_json::to_string(doc)?;
    let c_json = CString::new(json_str)?;
    let c_branch = Self::optional_cstring(branch)?;

    let result = unsafe {
        ffi::chrondb_put(
            self.thread,
            self.handle,
            c_id.as_ptr() as *mut c_char,
            c_json.as_ptr() as *mut c_char,
            Self::ptr_or_null(&c_branch),
        )
    };

    self.parse_string_result(result)
}
```

## The Data Flow

Let's trace a `put` operation from Python through all layers:

```
Python: db.put("user:1", {"name": "Alice"})
  |
  v
ctypes: lib.chrondb_put(thread, handle, b"user:1", b'{"name":"Alice"}', None)
  |
  v
libchrondb.so: chrondb_put(IsolateThread, int, CCharPointer, CCharPointer, CCharPointer)
  |
  v
ChronDBLib.java: Converts C strings to Java, calls libPut.invoke(...)
  |
  v
chrondb.lib.core/lib-put: Parses JSON, calls storage/save-document
  |
  v
GitStorage: Creates virtual commit with document
  |
  v
LuceneIndex: Indexes document for search
  |
  v
Returns JSON string back through all layers
```

Each layer handles its concerns:

- **Python**: Encoding, type conversion, JSON serialization
- **C ABI**: Memory layout, calling convention
- **Java**: Exception handling, Clojure interop
- **Clojure**: Business logic, persistence

## Why This Architecture?

1. **Single source of truth**: The Clojure implementation is canonical. Bindings are thin wrappers.

2. **No serialization overhead**: Data crosses the boundary as C strings (JSON). No complex serialization protocols needed.

3. **Consistent behavior**: Python and Rust users get identical semantics because they call the same underlying code.

4. **Maintainability**: Changes to ChronDB core automatically propagate to all bindings after rebuilding.

5. **No runtime dependencies**: The shared library is self-contained. No JVM required at runtime.

## Recommended Reading

For those wanting to dive deeper into FFI and language interoperability:

- **"The Rust Programming Language" (Klabnik & Nichols)** - Chapter on FFI covers unsafe Rust, CString, and calling C from Rust. Essential for understanding how bindgen-generated code works and how Rust safely interfaces with C libraries. [Source](https://doc.rust-lang.org/book/)

- **"Clojure Programming" (Emerick, Carper & Grand)** - Chapter on Java interop explains the IFn interface and how to call Clojure from Java - the exact pattern we use in the Java bridge layer. [Source](https://www.oreilly.com/library/view/clojure-programming/9781449310387/)

## Conclusion

The ChronDB polyglot architecture demonstrates that language boundaries are porous when you design for them. By leveraging GraalVM's native-image with `--shared`, we transform JVM code into native shared libraries that any language can consume.

The key principles:

1. **Opaque handles** instead of raw pointers for cross-language object references
2. **JSON** as the universal data interchange format
3. **Error codes** instead of exceptions at the C boundary
4. **Language-idiomatic wrappers** that feel native to each ecosystem

This approach scales: adding a new language binding (Go, Ruby, Node.js via N-API) requires only implementing the FFI wrapper layer. The core remains unchanged.

The code is open source at [github.com/moclojer/chrondb](https://github.com/moclojer/chrondb). PRs for new language bindings are welcome.
