---
title: The Four Memory Layers Inside Node.js
speaker: Tamar Twena-Stern
speakerId: tamar-twena-stern
---

Most Node.js memory discussions stop at "the V8 heap." Production systems are
rarely that simple. A Node.js process uses multiple memory systems
simultaneously: JavaScript objects on the V8 heap, native memory allocated by
Node.js and its dependencies, memory used by Buffers and streams, and memory
consumed by the operating system and external resources.

Understanding the interaction between these layers becomes essential when
applications start processing large datasets, streaming files, integrating with
native libraries, or mysteriously crashing with out-of-memory errors while the
heap looks perfectly healthy.

We'll cover how V8 organizes and garbage-collects the JavaScript heap, why
Buffers live outside the heap and can exhaust memory, native allocations inside
Node.js and third-party dependencies, how streams and backpressure affect
memory usage, why some leaks never appear in heap snapshots, and practical
techniques for profiling production memory issues.
