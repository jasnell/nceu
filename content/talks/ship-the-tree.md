---
title: Ship the Tree
speaker: Philipp Dunkel
speakerId: philipp-dunkel
---

Supply-chain attacks are no longer rare or exotic; they are routine. Yet most
Node.js applications are still deployed by resolving a dependency tree at
install time, fetching it from a registry we don't run, and trusting that the
bytes behind a version number are the ones someone actually reviewed. So how
should we be shipping applications now? We need to know exactly what lands on
our machines and what is actually running there, who vouches for it, and
whether we can open it up and read it for ourselves, without taking anyone's
word for it. This talk is about making the thing you tested the thing you
ship: a single, known, auditable artifact, with the question of whom to trust
left to you rather than baked into the runtime.
