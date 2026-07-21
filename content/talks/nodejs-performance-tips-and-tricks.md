---
title: NodeJS Performance Tips & Tricks
speaker: Robert Nagy
speakerId: robert-nagy
---

Most Node.js performance advice stops at "use async/await" and "run a
profiler." This talk picks up where that ends. Drawing from years of shipping a
high-throughput broadcast platform, we'll cover the patterns that actually move
the needle: allocation-free hot paths, sync fast paths where async is 190×
slower, cooperative scheduling, sqlite, and scaling with Workers.

You'll leave with a mental model of where Node.js spends its time and a handful
of building blocks to drop into your own code.
