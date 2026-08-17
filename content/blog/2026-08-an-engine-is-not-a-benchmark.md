---
date: "2026-08-17"
draft: false
title: "An engine is not a benchmark"
tags: ["engineering", "webkit", "browser", "zer0", "rust", "swift", "chromium"]
description: "Why zer0 renders with WebKit and not Chromium, argued without a benchmark, with the measured cost of the choice written next to it."
url: "/an-engine-is-not-a-benchmark"
---

[The last post](https://avelino.run/taste-is-not-a-method/) was only the decisions where something got measured and the measurement changed the drawing. This one is about the decision underneath all of them, the one taken before any of that existed, where nothing was measured because nothing could be.

zer0 renders with [WebKit](https://github.com/WebKit/WebKit). There is no [Chromium](https://www.chromium.org/Home/) path, not in parallel and not as a fallback.

I cannot show you a benchmark where WebKit beats Blink. I never ran one, and if I had run one it would not have changed the answer, because rendering speed is not what this choice is about. An engine is not a component you evaluate on a chart and swap when a better one appears. It is the set of decisions you agree to inherit for as long as the project exists, and the only useful question is whose decisions those are and what they cost you when you disagree.

So this is the argument, with the receipts, including the ones that go against me.

## Gecko was never on the table, and that is not my opinion

People read "not Chromium" as "so, Firefox?", and it is worth ending that quickly, because it was not a preference.

Mozilla removed general embedding support for Gecko in 2011. The stated reasons were the difficulty of the work, the coming move to a multi-process model, and the decision to prioritise Firefox itself, which is a legitimate set of reasons and also a final one. The only maintained embedding surface Gecko has today is [GeckoView](https://mozilla.github.io/geckoview/), and GeckoView is Android-only.

Gecko is an engine inside an application. It is not an engine you can build an application on. There is no macOS API that hands you a Gecko view, no framework to link, nothing to embed. Choosing it would have meant maintaining a fork of Firefox, which is the thing nobody who has tried it recommends and nobody who has not tried it should attempt.

Two engines are being written right now specifically to change this situation, [Servo](https://github.com/servo/servo) and [Ladybird](https://github.com/LadybirdBrowser/ladybird), and I am glad both exist. Neither is something I would ask a person to open their bank in today.

That leaves three engines, and one of them was not available. The real choice was two.

## The alternative browsers are one browser

Every "alternative" browser you can name is Chromium wearing a different coat. That sounds like a slogan until you watch what happens when the coat and the body disagree.

When Manifest V3 landed and the extension platform changed underneath everyone, [Vivaldi said it in plain words](https://vivaldi.com/blog/manifest-v3-webrequest-and-ad-blockers/): "As Vivaldi is built on the Chromium code, how we tackle the API change depends on how Google implements the restriction." That is the whole thing in one sentence. A browser with a different logo, a different UI philosophy, a different privacy stance and a different company, and the extension platform is still a downstream notification.

This is not a complaint about Google's intentions. It is a description of where a decision physically lives. If the engine is Chromium, then the extension model, the network stack's policy surface, the process model and the deprecation schedule are all upstream of you, and your options when you disagree are to carry a patch set forever or to explain to your users that it depends on how Google implements it.

None of this is a complaint about Blink's quality. Blink is very good, which is exactly why it won, and winning that completely is the problem. When one implementation is the web, the specification stops being the contract and the implementation becomes it, so a bug that ships widely enough turns into behaviour somebody depends on, and then into a compatibility requirement the next engine has to reproduce before anyone will use it.

An independent engine on a small project does not fix that. It just refuses to add to it.

## The argument that used to end this conversation expired in March 2025

For fifteen years the answer to "why not WebKit" was extensions, and it was a good answer. It stopped being true on macOS 15.4, when `WKWebExtension` became public API. It loads Manifest V2 and V3. It covers `declarativeNetRequest`, `webRequest`, `scripting`, `tabs`, `cookies`, `storage` and `nativeMessaging`. It was built by Apple for third-party browsers rather than only for Safari, which matters, because it means the extension's view of the browser is maintained by the same people who maintain the engine.

The alternative, which is what you do if you want extensions and do not have that, is implementing the `chrome.*` namespaces yourself. That is months of work before the first extension loads, it is permanently behind, and every gap arrives as a bug report you own.

So the argument expired. **It did not expire cleanly, and the honest version of this section is the measurement, not the announcement.**

I loaded fifty-nine real store packages into a real `WKWebExtensionController` on macOS 26.6 with every permission granted. Fourteen of them never start their background worker. Six of those fourteen die on a single missing member of a namespace that is present, which is the worse failure, because the namespace check passes and the code proceeds. [React Developer Tools](https://github.com/facebook/react/tree/main/packages/react-devtools) 7.0.1 dies on `scripting.ExecutionWorld.ISOLATED`. [Vimium](https://github.com/philc/vimium), [DuckDuckGo](https://github.com/duckduckgo/duckduckgo-privacy-extension), [LanguageTool](https://github.com/languagetool-org/languagetool), [Privacy Badger](https://github.com/EFForg/privacybadger) are in the list.

`WKWebExtension` installs exactly seventeen `chrome.*` namespaces. Twenty-five others that extensions in that corpus name are `undefined` no matter what is granted. The most common fatal one is `chrome.notifications`, missing in thirteen of the fifty-nine.

And the failure is silent from inside. `controller.load` succeeds and returns no error. Seconds later `WKWebExtensionContext.errors` gains `backgroundContentFailedToLoad`, with no delegate callback for it, and in the failing case `loadBackgroundContent`'s completion handler was never called at all. From a user's chair that reads as the browser being broken, because from a user's chair there is nothing else it could be.

That is the real state of it. Extensions on day one instead of in a year, maintained by the engine's own authors, and roughly a quarter of a real corpus does not run.

## The one place where the engine choice is a straight win

Content blocking on WebKit is not an extension. It is a primitive.

`WKContentRuleList` takes JSON, compiles it into bytecode, and evaluates it in the networking layer, ahead of the page. The rules never see the page and the page never sees the rules. There is no content script, no injected frame, no extension that has to be installed and kept alive, and nothing for a page to detect. An extension doing the same job through `declarativeNetRequest` goes through more machinery and depends on somebody having installed it.

Measured on the macOS 26.5 SDK, cold compile by list size: 100 rules 0.8 ms, 1,000 rules 2.8 ms, 5,000 rules 11.5 ms, 20,000 rules 46 ms, 50,000 rules 119 ms. Warm lookup through `lookUpContentRuleList` is 0.1 ms at every one of those sizes, which is the number that matters, because compilation happens once per change and lookup happens every launch.

The list zer0 ships is 77 rules and 9,562 bytes of JSON. Median cold compile 1.75 ms. Median warm lookup 0.05 ms.

Underneath it, WebKit's own Intelligent Tracking Prevention is heuristic, on-device, always on, and needs no list at all. It runs whether the list is on or off.

This is the part of the choice that pays rent every day, and it matters more than it looks, because a browser that is lighter than Chromium and then loads every tracker on the page has handed the advantage straight back.

**And here is the price, in the same section, because that is the rule.** `WKContentRuleList` carries exactly one public member, `identifier`. There is no public way to ask how many requests it blocked. The only reporting path is `_WKContentRuleListAction`, which is SPI. So the number every other browser prints on a shield badge is not available to this browser honestly, and the badge is not there. The grammar is narrow too: alternation, `{2,4}` counts, lookahead and `\b` are all refused, an uppercase letter in `if-domain` is refused, one bad rule fails the entire list, and an unknown trigger key is accepted silently and does nothing, which is the failure mode you would least like to have.

## What it costs to not be Blink is not rendering. It is being recognised

This is the part I did not predict, and it is the strongest argument for engine diversity I have, because it is an argument against the current state rather than for my taste.

A `WKWebView` inside a third-party app produces a User-Agent ending in `(KHTML, like Gecko)` and carrying no browser token at all. Large sites read that as an unsupported browser. So zer0 appends `Version/… Safari/605.1.15 zer0/x.y.z`, which is honest: it is Safari's engine, and it says which browser is driving it.

Then the extensions arrived and the honest string turned out to be the bug.

1Password 8.12.30.21, an untouched store package, tests `navigator.userAgent.indexOf("Chrome") !== -1`. Told the truth, it routes down the Safari App Extension path and never opens a port. `desktopAppState: Disconnected`, `PortClosed`, no error anywhere. [Bitwarden](https://github.com/bitwarden/clients) 2026.7.0 asks its own User-Agent for `Chrome/`, `Safari/`, `Firefox/`, `Edg/`, `OPR/`, `Vivaldi/` and `Gecko/`, matches none of them, and throws inside `this.device.toString` during worker initialisation, and because Manifest V3 makes a module-init throw fatal, the worker simply never starts.

Neither of those is a rendering difference. Neither would show up in a benchmark, a web platform test, or any measurement of the engine at all. They are `indexOf` calls, written years ago by people who were being reasonable at the time, that have quietly become part of the web's definition of a browser.

The fix is small and it tells you exactly how the monopoly is actually enforced: extension contexts now announce `Version/<safari> Chrome/<chrome> Safari/605.1.15 zer0/<ours>`. Not per-extension, because per-extension is not a lever WebKit gives us. `WKWebExtensionContext` has no `customUserAgent`, so the controller's shared configuration reaches the popup, the options page, the background worker and any page the extension opens as one population.

The browsing User-Agent still does not say Chrome, and it will not. On the Chrome Web Store's own pages, claiming Chrome suppresses Google's "Switch to Chrome?" modal, and the install button stays disabled either way, because installing from that button needs `chrome.webstorePrivate`. What replaces the modal is the text "Item currently unavailable", which is false. We are choosing to look broken in order to be honest.

Ten thousand `indexOf("Chrome")` checks are a stronger moat than any rendering advantage, and nobody built that moat on purpose. That is what a second implementation is for.

## The rest of the bill

The cost of WebKit is API coverage, and it arrives in small concrete places rather than in one large one.

Muting a page's audio has no public API. `EngineHost.swift` injects `document.querySelectorAll('video,audio')…` and reapplies it after every navigation, because there is no other way. On Chromium that is a property.

Experimental feature flags are unreachable. `_WKFeature`, `WKPreferences._features`, `_setEnabled:forFeature:` are all SPI, so a feature behind a flag does not exist for us.

The Web Inspector has no public way to open. `isInspectable` is the only public member, and opening it takes three private calls. This project allows exactly one file to spell SPI, enforced by a test that reads string literals so a selector reached through the Objective-C runtime is caught too. The accepted cost is written down: the App Store is closed to this build.

Printing goes through `_webView:printFrame:`, which is SPI. That is Safari's route as well.

The context menu is the engine's. Right-clicking a page gives Reload and nothing else, there is no "Open Link in New Tab" at all, and it offers "Search with Google" regardless of the search engine the browser is configured to use.

Every method in `WKUIDelegate`, `WKNavigationDelegate` and `WKDownloadDelegate` is optional, and WebKit's answer to an unimplemented optional is a documented default chosen for an embedded web view inside somebody else's app. For a browser those defaults are frequently the worst available answer and none of them raises, logs or returns an error. Six defects arrived exactly that way: `window.open`, `target="_blank"`, `<input type="file">`, `alert()`, `confirm()`, `prompt()`. A `mailto:` click destroyed the page. HTTP Basic auth rendered the server's raw 401 body to the user.

And the one with no workaround at all: **web compatibility is Safari's.** A bug that only appears on a site tested against Blink reaches this project as a user complaint rather than as a failing test, and there is no way to see it coming.

For balance, the process model earns its reputation. Kill the web content process with `SIGKILL` and `reload()` commits, finishes, and comes back with a fresh web process in under fifty milliseconds.

## Picking WebKit is only half a decision. The other half is whose WebKit

Here is the sentence that turned out to matter most: a browser that renders with whatever WebKit the machine happens to have is a browser whose engine changes underneath it.

The system framework is free and it is genuinely good value. A shell that borrows the system engine is 7.4 MB in release and builds in eleven seconds. Engine CVEs arrive through the macOS update with us out of the loop, which is a real security advantage and I want to be clear that giving it up hurt.

zer0 builds WebKit from source and embeds it anyway, pinned per channel. Stable sits on a `WebKit-*` source-drop tag, because those are the drops Apple actually shipped a Safari from, so each one built and survived a release cycle. Canary sits on an exact commit of `main`, because `main` is whatever landed an hour ago and regularly does not build.

The measurements, on an M4 Max with 14 cores and 36 GB, macOS 26.6:

| | release | debug |
| --- | --- | --- |
| system WebKit | 7.4 MB | 59 MB |
| embedded WebKit | 387 MB | 439 MB |

Shallow checkout of the pinned tag: 7.4 GB, 455,214 files, about twenty minutes. Clean release build: 35 minutes 34 seconds, 110 targets, one `xcodebuild`. `WebKitBuild/` afterwards: 34 GB, of which 5.2 GB is products. Incremental no-op rebuild: 31 seconds. In CI that is about 35 minutes per channel, weekly, paid by runners rather than by users.

That 34 GB is worth one aside. The README said "on the order of 100 GB", which is 2.5x the measured number, and the build script still refuses to start with less than 100 GB free because a conservative floor costs nothing. I only know the estimate was wrong because somebody ran it. Reasoning about disk is exactly as reliable as reasoning about anything else in this project, which is to say: not.

The 387 MB is the cheap half. The expensive half is that a WebKit CVE is now mine. Tracking advisories, deciding whether the pin is affected, rebuilding, re-signing, shipping. **A user with macOS fully up to date now runs a stale engine if I do not cut a release.** The trade is "the engine changes underneath the app without warning" for "the engine changes only when I touch it", and the second half of that sentence is an operational obligation the project does not yet have. Nobody automated the bump. The pin sat unmoved from 8 August until a bot was written to move it.

So that decision names the condition under which it is wrong, in the file, in advance: on the first WebKit CVE published after the first embedded release, if there is no rebuild-and-ship path that fits inside a week, the decision was wrong and the security cost beat the autonomy one.

Two things fall out of embedding that I did not go looking for. Building from a public tag settles the licensing question that redistributing Apple's binary frameworks would raise. And the LGPL obligations that come with the engine in the bundle include shipping a way for the user to replace those frameworks, which is a strange and pleasing thing to owe: the licence obliges the browser to let you swap its engine.

The About window prints one line, "Engine: embedded WebKit 7624.4.5.14.1" or "Engine: system WebKit 21624.4.5.11.5", and works out which by asking where `WKWebView` actually came from, so an embed that dyld silently dropped reports "system", which is the truth.

## What I cannot tell you

[ADR-0001](https://github.com/thezer0com/zer0/blob/main/docs/adr/0001-webkit-as-the-engine-not-chromium.md) says that on the Mac, WebKit is the engine Apple tunes for Apple hardware, and that power draw and battery are not a footnote.

There is no measurement behind that sentence. Not a bad one, not an old one. None. It is the most quoted claim in the WebKit argument and, in this repository, it is prose.

[The last post](https://avelino.run/taste-is-not-a-method/) ended by naming `#ff3e3e` as the number that reads most like a result and is a line in a README with nothing underneath it. This is the same defect, in the decision that everything else sits on. If somebody wants to hand me a number for battery on a like-for-like page set, I want it more than I want the argument, and I would rather publish it against me than keep quoting a sentence nobody measured.

What I can tell you is what would make the whole thing wrong, because that was written down when the choice was still live. Two triggers, both named. `WKWebExtension` falling far enough behind that the main blockers stop loading, or Apple closing or freezing the public extension API. And a platform target becoming mandatory where no maintained WebKit exists, which is Android and is a known dead end. Outside those two, never.

The record has grown from 44 decisions at the last post to 115. Fifteen of them carry `none — debt` in the field where the test should be, up from six, and [ADR-0001](https://github.com/thezer0com/zer0/blob/main/docs/adr/0001-webkit-as-the-engine-not-chromium.md) is one of them, because there is no possible test for "we picked an engine". What is testable is the absence of SPI, and that is a source lint. So the largest decision in the project is defended by nothing, and says so.

That is the honest sale. Not a faster engine. A second implementation, an engine-level blocker that costs 0.05 ms, an extension surface maintained by the people who maintain the engine, and a pinned build I control the release cadence of. Against: a quarter of a real extension corpus that does not start, a web that runs `indexOf("Chrome")` on me, an App Store I have closed to myself, and Safari's compatibility bugs arriving as user complaints.

I would take that trade again. What I would not do is dress it up as a benchmark.

---

**zer0** is open source: [github.com/thezer0com/zer0](https://github.com/thezer0com/zer0)

The reasoning above is not reconstructed for this post. Every record below was written while the choice was still live, and each one names what it cost and which test dies if you undo it: [ADR-0001](https://github.com/thezer0com/zer0/blob/main/docs/adr/0001-webkit-as-the-engine-not-chromium.md) on the engine itself, [ADR-0005](https://github.com/thezer0com/zer0/blob/main/docs/adr/0005-we-build-webkit-from-source-and-embed-it.md) on building WebKit from source and embedding it, [ADR-0020](https://github.com/thezer0com/zer0/blob/main/docs/adr/0020-chrome-extensions-run-on-apples-wkwebextension.md) on extensions, [ADR-0058](https://github.com/thezer0com/zer0/blob/main/docs/adr/0058-zer0-writes-its-own-block-list-compiles-it-once-per-change-and-says-what-it-does-not-block.md) on content blocking, [ADR-0067](https://github.com/thezer0com/zer0/blob/main/docs/adr/0067-the-web-inspector-is-the-one-spi-reached-by-name-at-runtime.md) on the Web Inspector, [ADR-0072](https://github.com/thezer0com/zer0/blob/main/docs/adr/0072-an-extension-webkit-could-not-start-is-not-reported-as-running.md) on the silence when an extension fails to start, [ADR-0073](https://github.com/thezer0com/zer0/blob/main/docs/adr/0073-zer0-does-not-claim-to-be-chrome-on-the-stores-hosts-or-anywhere-else.md) on refusing to claim to be Chrome, [ADR-0084](https://github.com/thezer0com/zer0/blob/main/docs/adr/0084-a-permission-this-browser-cannot-provide-is-stated-rather-than-switched.md) on what the extension surface actually installs, [ADR-0086](https://github.com/thezer0com/zer0/blob/main/docs/adr/0086-the-unimplemented-engine-surface-is-enumerated-rather-than-discovered-one-defect-at-a-time.md) on the unimplemented engine surface, [ADR-0091](https://github.com/thezer0com/zer0/blob/main/docs/adr/0091-the-engines-context-menu-is-amended-rather-than-replaced-and-the-core-decides-the-amendment.md) on the context menu, [ADR-0100](https://github.com/thezer0com/zer0/blob/main/docs/adr/0100-the-gap-zer0-fills-is-a-missing-member-never-a-missing-namespace-and-the-package-it-modifies-says-so.md) on missing members, [ADR-0103](https://github.com/thezer0com/zer0/blob/main/docs/adr/0103-cannot-and-will-not-are-different-sentences-and-the-ones-that-are-ours-are-answered-rather-than-stated.md) on the fifty-nine packages, [ADR-0106](https://github.com/thezer0com/zer0/blob/main/docs/adr/0106-extension-contexts-name-chrome-because-per-extension-is-not-ours-to-build.md) on the User-Agent extension contexts get, and [ADR-0124](https://github.com/thezer0com/zer0/blob/main/docs/adr/0124-each-channel-pins-its-own-webkit-and-the-about-window-names-the-engine-that-runs.md) on the per-channel pins and the About window. Several admit they have no test at all. You can disagree with any of them with the file open in front of you.

Disagree, but share your opinion in an [issue on the zer0 repository](https://github.com/thezer0com/zer0/issues/new), and come help me build a better and open internet for everyone!
