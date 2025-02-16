+++
date = "2025-02-16"
title = "ClojureScript Wrapper for @logseq/libs - Build Better Logseq Plugins"
tags = ["clojurescript", "logseq-plugin", "logseq-development", "@logseq/libs", "cljs", "functional-programming", "open-source", "plugin-development"]
description = "A native ClojureScript wrapper for @logseq/libs enabling idiomatic plugin development for Logseq. Build powerful, maintainable plugins using functional programming and REPL-driven development."
comment = false
url = "/logseq-libs-clojurescript"
link = "https://github.com/avelino/logseq-libs"
img = "https://cljsocial.sfo3.cdn.digitaloceanspaces.com/accounts/avatars/111/393/159/877/487/513/original/4e74f973683a2f29.png"
+++

![Logseq Logo](https://cljsocial.sfo3.cdn.digitaloceanspaces.com/accounts/avatars/111/393/159/877/487/513/original/4e74f973683a2f29.png)

**@logseq/libs** for *ClojureScript* provides a native bridge for developing Logseq plugins using ClojureScript. This wrapper transforms the TypeScript-based plugin API into an idiomatic ClojureScript interface, allowing developers to leverage functional programming and REPL-driven development while maintaining full compatibility with the Logseq ecosystem.

## Key Features

- Write plugins in the same language as Logseq's core
- Leverage ClojureScript's elegant syntax and functional programming paradigms
- Benefit from ClojureScript's type system while maintaining JavaScript interop
- Seamless integration with existing Logseq plugin ecosystem
- Access to both ClojureScript and JavaScript libraries

## Getting Started

To get started, add the following dependency to your `deps.edn`:

```edn
{:deps {run.avelino/logseq-libs {:mvn/version "0.2.1.0"}}}
```

Here's a simple example of a plugin:

```clojure
(ns my-awesome-plugin.core
  (:require [run.avelino.logseq-libs.core :as ls]
            [run.avelino.logseq-libs.ui :as ui]))

(ls/ready!
  (fn []
    (ui/show-msg! "Plugin loaded!")

    (ls/register-command-palette!
      {:key "hello-world"
       :label "Greet User"
       :keybinding "mod+shift+h"
       :callback #(ui/show-msg! "Hello from ClojureScript!")})))
```

## API Reference

### Core Module (`run.avelino.logseq-libs.core`)

Core functionality for plugin lifecycle and settings management.

```clojure
(require '[run.avelino.logseq-libs.core :as ls])
```

#### Plugin Lifecycle

- `ready! [callback]` - Initialize plugin with callback function
- `disable-plugin! []` - Disable the current plugin
- `reload-plugin! []` - Reload the current plugin

#### Settings Management

- `register-settings! [settings]` - Register plugin settings schema
- `get-settings! []` - Get current plugin settings
- `update-settings! [settings]` - Update plugin settings

#### Command Registration

- `register-command! [cmd]` - Register a single command
- `register-command-palette! [cmd]` - Register a command in the command palette
- `register-block-command! [cmd]` - Register a block-level command

### UI Module (`run.avelino.logseq-libs.ui`)

User interface components and notifications.

```clojure
(require '[run.avelino.logseq-libs.ui :as ui])
```

#### Notifications

- `show-msg! [content & opts]` - Show notification message
- `show-error! [content]` - Show error notification
- `show-warning! [content]` - Show warning notification

#### UI Components

- `open-modal! [opts]` - Open a modal dialog
- `close-modal! []` - Close current modal
- `show-prompt! [content & opts]` - Show prompt dialog
- `show-picker! [opts]` - Show item picker dialog

### Editor Module (`run.avelino.logseq-libs.editor`)

Block and page manipulation functions.

```clojure
(require '[run.avelino.logseq-libs.editor :as editor])
```

#### Page Operations

- `get-current-page! []` - Get current page data
- `get-page! [name]` - Get page by name
- `create-page! [name content & opts]` - Create new page
- `delete-page! [name]` - Delete page by name

#### Block Operations

- `get-block! [uuid]` - Get block by UUID
- `insert-block! [uuid content & opts]` - Insert new block
- `update-block! [uuid content]` - Update block content
- `remove-block! [uuid]` - Remove block by UUID
- `get-block-property! [uuid key]` - Get block property
- `set-block-property! [uuid key value]` - Set block property

### DB Module (`run.avelino.logseq-libs.db`)

Graph database queries and operations.

```clojure
(require '[run.avelino.logseq-libs.db :as db])
```

#### Queries

- `q! [query & inputs]` - Execute Datalog query
- `datascript-query! [query & inputs]` - Execute raw Datascript query
- `get-current-graph! []` - Get current graph info
- `get-pages! [& opts]` - Get all pages
- `get-page-blocks! [page-name]` - Get all blocks for a page

### Git Module (`run.avelino.logseq-libs.git`)

Version control operations.

```clojure
(require '[run.avelino.logseq-libs.git :as git])
```

#### Repository Operations

- `get-head-commit! []` - Get current HEAD commit
- `checkout! [ref]` - Checkout specific reference
- `create-branch! [name]` - Create new branch
- `get-branches! []` - List all branches

### Assets Module (`run.avelino.logseq-libs.assets`)

File and asset management.

```clojure
(require '[run.avelino.logseq-libs.assets :as assets])
```

#### Asset Operations

- `make-asset-url! [path]` - Create asset URL
- `upload-asset! [file]` - Upload asset file
- `list-assets! []` - List all assets
- `remove-asset! [path]` - Remove asset

### Theme Module (`run.avelino.logseq-libs.theme`)

Theme customization and management.

```clojure
(require '[run.avelino.logseq-libs.theme :as theme])
```

#### Theme Operations

- `get-theme! []` - Get current theme
- `set-theme! [theme]` - Set active theme
- `toggle-theme! []` - Toggle between light/dark themes
- `add-style! [style]` - Add custom CSS styles
- `remove-style! [id]` - Remove custom styles

### Utils Module (`run.avelino.logseq-libs.utils`)

Utility functions for common plugin operations.

```clojure
(require '[run.avelino.logseq-libs.utils :as utils])
```

#### Utility Functions

- `format-date! [date format]` - Format date with specified format
- `uuid! []` - Generate a new UUID
- `debounce! [f ms]` - Create a debounced version of a function
- `throttle! [f ms]` - Create a throttled version of a function
- `parse-json! [str]` - Parse JSON string to ClojureScript data structure
- `to-json! [data]` - Convert ClojureScript data to JSON string

### Macros Module (`run.avelino.logseq-libs.macros`)

Useful macros for plugin development.

```clojure
(require '[run.avelino.logseq-libs.macros :as macros :include-macros true])
```

#### Available Macros

- `defplugin` - Define a new plugin with lifecycle hooks
- `with-promise->` - Thread-first macro for promise-based operations
- `with-promise->>` - Thread-last macro for promise-based operations
- `catch->error` - Catch and handle errors in promise chains

## Why ClojureScript for Logseq Plugins?

1. **Native Development**: Use the same language as Logseq's core for deeper understanding and better integration
2. **Functional Programming**: Leverage immutable data structures and functional paradigms for more reliable plugins
3. **REPL-Driven Development**: Test and modify your plugin in real-time
4. **Concise, Readable Code**: Write more expressive code with ClojureScript's elegant syntax

The project provides ClojureScript wrappers for all major Logseq plugin APIs including core functionality, UI components, editor operations, database queries, git operations, and theme customization.

Join us in building the future of knowledge management tools with ClojureScript! Visit our [GitHub repository](https://github.com/avelino/logseq-libs) to get started or contribute to the project.
