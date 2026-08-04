---
title: Improving the capabilities of Emscripten, WebAssembly and Rust
speaker: Guy Bedford
speakerId: guy-bedford
---

Cloudflare's Rust Workers project brings Rust support to Cloudflare Workers
through WebAssembly, extending the V8 sandbox beyond JavaScript. Rust Workers
uses the same WebAssembly toolchains that have targeted browsers and Node.js
for many years.

Despite their maturity, significant challenges remain in supporting native Rust
applications — particularly in reconciling their assumed POSIX semantics with
JavaScript runtime models, and their differing approaches to asynchronous tasks
and I/O.

We'll share experimental contributions to Tokio that provide JavaScript-friendly
epoll virtualization, culminating in a demonstration of full-featured Rust
applications running on both Cloudflare Workers and Node.js.
