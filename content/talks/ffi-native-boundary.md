---
title: "FFI: Crossing the Native Boundary in Node.js"
speaker: Paolo Insogna
speakerId: paolo-insogna
---

We will tell the story of how `node:ffi` made its way into Node.js core: from
the original implementation work by Bryan English, through the renewed
initiative started by Colin Ihrig, to the final design and implementation now
landing in Node.js.

We'll walk through the original exploration, the technical challenges, and the
lessons learned while trying to expose foreign function interfaces safely and
ergonomically to JavaScript developers, then cover the final implementation,
the API shape, the design trade-offs, and the performance characteristics
measured along the way.

This talk is for anyone interested in native interoperability, Node.js
internals, performance, or the long path from an experimental idea to a core
module.
