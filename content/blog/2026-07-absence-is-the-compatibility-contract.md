---
date: "2026-07-31"
draft: false
title: "Absence is the compatibility contract"
tags: ["mcp", "protocol", "rust", "backwards-compatibility", "testing", "engineering"]
description: "MCP 2026-07-28 deleted the initialize handshake and protocol-level sessions. My proxy sits on both sides of that wire and every backend it talks to is still on the old revision, so picking one was never an option. This is how I got two protocol eras to share one codebase, and the four defects a green test suite never showed me."
url: "/absence-is-the-compatibility-contract"
---

MCP [announced](https://blog.modelcontextprotocol.io/posts/2026-07-28/) revision [`2026-07-28`](https://modelcontextprotocol.io/specification/2026-07-28) three days ago. It deletes the `initialize` handshake and protocol-level sessions. Every request now carries its own protocol version, client identity and capabilities in `_meta`, and every result carries a `resultType`. It is the largest breaking change the protocol has had, and the [changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog) runs long.

I maintain [mcp](https://github.com/avelino/mcp), a CLI that turns MCP servers into terminal commands and can run as a proxy in front of them. That puts me on both sides of the wire at once. To Claude, Cursor and whatever else connects, my proxy is a server. To the backends behind it, npx processes and HTTP endpoints, it is a client. Every one of those backends is on [`2025-11-25`](https://modelcontextprotocol.io/specification/2025-11-25) or older and will be for a year.

So the interesting problem was never implementing the new revision. It was keeping the old one alive in the same binary, byte for byte, while the new one runs beside it.

## One rule, applied everywhere

The whole compatibility story collapses into a single sentence I wrote at the top of the work and refused to bend: **the absence of a field, header or `_meta` key is the legacy path, never an error.**

That sounds obvious. It is not what you write by default. The default instinct when you implement a spec that says "every request MUST carry `_meta`" is to reject requests without `_meta`. Do that and every client in the world breaks on the day you deploy.

The rule turns each new requirement into a conditional instead of a validation. Missing `resultType`? That is a peer from before `resultType` existed, and the spec agrees:

```rust
/// `resultType` of a peer's result. A result from an earlier-revision
/// peer omits the field and MUST be read as `"complete"`.
pub fn result_type(result: &Value) -> &str {
    result
        .get("resultType")
        .and_then(|v| v.as_str())
        .unwrap_or(RESULT_TYPE_COMPLETE)
}
```

Missing `Mcp-Method` header? Legacy client, serve it. Header present but disagreeing with the body? That is a gateway routing on a lie, reject with `-32020`. Validate what is there, never demand what is absent.

Version selection reads the same way. Revisions are ISO dates, so chronological ordering is string ordering and the check is one line:

```rust
pub fn is_stateless_version(version: &str) -> bool {
    version >= PROTOCOL_VERSION_STATELESS
}
```

## The contract before the parts

Before writing any of the two sides, I wrote the shared vocabulary: the version constants, the `_meta` key names, the error codes, the `resultType` helpers, the header encoder. One file, `protocol.rs`, with tests.

I did that because the client and the server halves of this change are the same rules pointing in opposite directions. The client encodes a header, the server decodes it. The client stamps `_meta`, the server reads it. If those two ever hold slightly different versions of the same rule, you get bugs that neither side can see alone, because each side is self-consistent and correct on its own terms.

I still got one of those bugs. More on that below. But I got exactly one, and the reason I got only one is that most of the rules lived in a single definition both sides imported.

## Four outcomes, not two

The client has to figure out which era a peer speaks. The spec sanctions probing `server/discover` first and falling back to `initialize` on failure, and my first instinct was a `Result`: it worked or it didn't.

That instinct was wrong, and a stdio backend is why. Modelling the probe as four outcomes instead of two is the difference between a fallback that works and one that kills a working connection:

```rust
enum Probe {
    Discovered(Box<ServerDiscoverResult>),
    /// The peer answered, just not with a discovery result, a JSON-RPC
    /// error, no result, or a result of some other shape. An old peer.
    Unsupported(anyhow::Error),
    /// Nothing came back inside the probe budget. The peer is most likely
    /// alive and ignoring a method it never heard of, so we leave it running
    /// and fall back on the same transport.
    TimedOut,
    /// The transport itself failed under the probe. A stdio backend that
    /// exits on an unknown method takes the connection down with it, so the
    /// fallback handshake would otherwise run on a dead pipe.
    Died(anyhow::Error),
}
```

`TimedOut` and `Died` look like the same thing from a `Result`. They demand opposite responses. A peer that ignores an unknown method is healthy, so re-spawning it would kill a working process and pay the cold start twice. A peer that exited took the pipe with it, so the fallback handshake has to run on a fresh transport or it fails against a corpse.

The probe also gets its own three second budget instead of inheriting the sixty second request timeout. The likeliest answer from every backend I proxy today is no answer at all, and that is not worth a minute of startup.

## The test suite was green and the handshake was broken

Here is the one that should worry you, because it is the failure mode you cannot grep for.

I implemented `server/discover`, the RPC that replaces the handshake. I wrote the type, the server emitted it, the client parsed it, tests covered both directions. 682 tests passing.

The wire shape was wrong. The spec's `DiscoverResult` calls the version list `supportedVersions` and puts server identity inside `_meta["io.modelcontextprotocol/serverInfo"]`. I had `protocolVersions` and a top-level `serverInfo`.

Against any compliant peer, discovery fails in both directions. My client would fail to parse a real server's answer, swallow it as "old peer", and fall back to an `initialize` that a modern-only server does not implement. My server would answer real clients with a shape they cannot read.

The tests passed because the fixtures were built from my own encoder. A struct that serialises and deserialises the same wrong field name round-trips perfectly against itself. Every assertion was true. The suite proved my code agreed with my code.

The fix was not renaming a field. It was changing what the test asserts against:

```rust
/// Pinned against the literal example on the spec's `server/discover`
/// page. The field names are the whole contract: a result that parses
/// only against our own encoder is exactly the bug this guards.
#[test]
fn discover_result_parses_the_spec_example() {
    let wire = json!({
        "resultType": "complete",
        "supportedVersions": ["2026-07-28"],
        "capabilities": {"tools": {}, "resources": {}},
        "_meta": {
            "io.modelcontextprotocol/serverInfo": {
                "name": "ExampleServer",
                "version": "1.0.0"
            }
        },
        "instructions": "This server provides weather and resource utilities.",
        "ttlMs": 3_600_000,
        "cacheScope": "public"
    });

    let parsed: ServerDiscoverResult = serde_json::from_value(wire).unwrap();
    assert_eq!(parsed.supported_versions, vec!["2026-07-28"]);
    let info = parsed.server_info().expect("serverInfo lives in _meta");
    assert_eq!(info.name, "ExampleServer");
}
```

That JSON is copied from the spec page, not generated by me. There is a second test asserting the old shape is now rejected, so drift in either direction fails loudly.

The generalisation, once: when you implement someone else's protocol, at least one test per message type has to assert against bytes you did not produce. Round-trip tests verify your encoder matches your decoder. They say nothing about whether either matches the world. It is the gap I wrote about in [reviewing is not understanding](/reviewing-is-not-understanding), where recognition confirms the shape you already carry in your head and the bug lives in whatever recognition cannot reach. A round-trip test is recognition, and it recognised my own mistake as correct.

## A bug that lived between two correct halves

`Mcp-Name` is a new header carrying the tool name or resource URI a request targets, so gateways can route without parsing the body. A resource URI is not header-safe. It holds UTF-8, spaces, percent escapes.

The client encoded it before sending. The server compared the received header against the raw value from the JSON body. Both correct in isolation. Both tested. Both passing.

Any `resources/read` on a URI containing a `%` or a space came back `-32020 HeaderMismatch`, which is most real URIs:

```
Mcp-Name header 'stub__file:///weekly%2520report.txt'
does not match request target 'stub__file:///weekly%20report.txt'
```

Two slices, each with a different notion of the same value, and neither could see the other. The defect existed only where they met, which is precisely where neither side's tests looked. I wrote about [the same shape at team scale](/the-bug-was-coordination-not-code) once, three teams each making a defensible call and the product breaking between them. Here it was two halves of one binary written days apart, and the mechanic is identical.

Then the fix I reached for was also wrong. I percent-encoded, because that is the obvious thing to do with a URI. The spec mandates a Base64 sentinel:

```
Mcp-Name: =?base64?{Base64EncodedValue}?=
```

with a rule that catches you if you skim: a plain ASCII value that merely *looks* like the sentinel must also be encoded, or the form is ambiguous. And `%` is an ordinary visible character in a header value, so re-encoding it is what desynchronised the two sides in the first place.

The encoder now lives in the shared contract, not in the client, with the reason written where someone will find it:

```rust
/// This lives in the shared contract, not in the client transport, because
/// the *server* validating `Mcp-Name` has to decode exactly what the client
/// encoded. Two copies of this rule that drift apart mean valid requests get
/// rejected as header mismatches.
```

## The type that lied

Under the new revision a server can answer `tools/call` with an interim result, `resultType: "input_required"`, asking the client for elicitation or a sampling completion. The client answers by retrying the original request with `inputResponses`. It is called MRTR, and it replaces the server-initiated requests the old revision allowed.

My proxy parsed every `tools/call` result into a typed `ToolCallResult` with a required `content` field. An interim result has no `content`. So a perfectly legal protocol exchange arrived as a serde parse error and went out as `-32603 internal error`.

Fixing it meant relaying the raw JSON on that path instead of round-tripping through a struct. Which surfaced something I had not gone looking for: that struct had been silently dropping `structuredContent` for over a year, a field the spec added in `2025-06-18`. Every backend that returned structured output had it deleted in transit by my proxy, and nobody noticed because the field just was not there on the other side.

A type that discards unknown fields is a filter you forgot you installed. On a proxy, where your job is to relay someone else's data faithfully, that is the wrong default.

The retry path had a matching trap. The proxy rebuilt backend params from `{name, arguments}`, the two fields it knew about. An MRTR retry carries `inputResponses` and `requestState` alongside those, so rebuilding dropped the continuation and stalled the exchange forever. It now forwards an explicit allowlist of the fields the spec defines, which keeps a client from smuggling arbitrary top-level keys into a backend through me.

## Security that does not secure

The revision hardens authorization, and this is where I shipped something that looked right and did nothing.

[RFC 9207](https://datatracker.ietf.org/doc/html/rfc9207) says the authorization server includes an `iss` parameter in the response, and the client MUST validate it before redeeming the code. I implemented both halves. The AS emits `iss`, the client compares it against the recorded issuer, mismatch aborts the flow. Tests for match, mismatch, absent, empty.

The check was inert.

Nothing validated that the `issuer` inside an AS metadata document matches the URL the document was fetched from, which [RFC 8414 §3.3](https://datatracker.ietf.org/doc/html/rfc8414#section-3.3) requires. Without that, the comparison is self-referential. A hostile MCP server declares its own `authorization_servers[0]`, that server's document declares a matching `issuer`, and my check compares the attacker's claim against the attacker's claim. It passes every time.

Worse, that same attacker-declared issuer was the key under which client registrations get stored, so a hostile server could overwrite the registration of a legitimate one.

The lesson is not "I forgot an RFC". It is that a validation is only worth what its reference value is worth. I had built a careful comparison against a number I let someone else write.

While fixing it I also found the `iss` comparison was one notch too loose. The authorization page is explicit:

> After decoding the `iss` value [...] clients **MUST NOT** apply scheme or host case folding, default-port elision, trailing-slash, or percent-encoding normalization before comparison.

My comparison ran both sides through a key-normalising helper that absorbs a trailing slash. It is now byte-exact, with 22 deny assertions covering each normalisation the spec forbids, in both directions, because a normalising client could normalise the received value, the recorded one, or both.

## What the legacy peer does not see

The last piece is the one I got wrong on the first pass, and the code told me three different stories about it.

New results carry `resultType`, `_meta.serverInfo`, `ttlMs` and `cacheScope`. I stamped them unconditionally, reasoning that an extra field is harmless. One file said legacy peers "must keep seeing byte-identical behavior". Another said stamping was deliberate and unconditional. A test named `legacy_client_is_served_exactly_as_before` claimed to guard it.

That test could not fail. Its assertion loop inspected the requests the test itself had built without `_meta` and without headers, then asserted they had no `_meta` and no headers. The two directions that could actually regress, the proxy's responses to the legacy client and the headers the proxy sends onward to the legacy backend, were never asserted.

So a 2024-11-05 client asking for `tools/list` was getting four fields it had never seen, and the test named after that exact guarantee was tautological.

Both are fixed. The stamping is gated on a flag threaded from the transport into dispatch, and the same gate covers the routing headers:

```rust
if self.is_stateless() || meta.protocol_version.is_some() {
    if let Some(value) = header_value(meta.method) {
        req = req.header(HEADER_MCP_METHOD, value);
    }
    // ...
}
```

The `||` is load bearing. The `server/discover` probe runs before negotiation finishes, so `is_stateless()` is still false, but the probe declares its version in the body. Gating on the body as well as on negotiated state keeps the probe fully labelled for gateways while nothing else leaks onto a legacy hop.

Rewriting the tautological test is what caught a fifth leak nobody had listed: `resultType` was also being stamped on every relayed result regardless of peer.

## What I would tell you if you are about to do this

Four things, in the order they cost me the most.

Assert against bytes from the spec, not bytes from your encoder. My worst defect survived 682 passing tests because the fixture and the implementation shared the same misunderstanding.

Name the rule once, in one place both sides import. The single bug that escaped that discipline was the one where the client and the server each held their own copy of an encoding rule.

Ask what a passing test would look like if the feature were deleted. If the answer is "still passing", the test is decoration. Two of mine were.

And treat absence as the contract. Every new MUST in a revision is a MUST for peers that opted into it. For everyone else it is silence, and silence has to keep meaning exactly what it meant before.

The proxy speaks both revisions now. A client on `2024-11-05` sees the same bytes it saw last year, a client on `2026-07-28` gets stateless dispatch, MRTR relay and cache hints, and neither knows the other exists.

---

**mcp** is open source: [github.com/avelino/mcp](https://github.com/avelino/mcp)
