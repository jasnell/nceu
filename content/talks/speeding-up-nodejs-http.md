---
title: "50% More Requests for Free: Speeding Up Node.js HTTP From the Inside"
speaker: Yagiz Nizipli
speakerId: yagiz-nizipli
---

Most Node.js apps spend most of their time handling HTTP. Yet the default
server path still carries a lot of unnecessary per-request and per-header
overhead in pure JavaScript: string concatenation for header blocks, multiple
write calls to finish responses, repeated validation steps, and keep-alive work
recomputed on every request instead of being reused.

Over the past several months I've been optimizing this path in Node core.
First, cutting constant overhead in the public `http` API by caching validation
decisions, adding known-header filters, sharing keep-alive state, and avoiding
an extra empty write at the end. Then, adding a native single-shot response
builder that serializes the typical HTTP/1.1 header block and optional body
directly in C++, while leaving the public API and the wire format unchanged. On
a keep-alive hello-world benchmark the native builder alone took throughput
from roughly 80k to 118–126k requests per second on the same machine.

This talk walks through the measurement methodology — interleaved A/B testing
and Welch's t-tests, rather than cherry-picking one good run — the edge cases
that forced fallbacks, what we learned comparing our changes with similar code
in Bun, and a practical checklist for anyone optimizing I/O-bound Node.js code:
what should stay in JavaScript, what belongs in C++, and how to ship big
performance wins without breaking compatibility.
