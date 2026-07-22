---
title: "Federated, but Contained: Exploring ShadowRealm and SES for Module Federation on Node.js"
speaker: Néstor López
speakerId: nestor-lopez
---

Module Federation lets a Node.js process load independently deployed code at
runtime. Nobody talks about the second half: once a federated ESM graph is
loaded, how do you update it, retire it, and actually get the memory back
without restarting the process?

This talk explores versioned graph boundaries as an alternative. Load
`checkout@v2` next to `checkout@v1`, route new traffic to v2, drain the old
requests, and let v1 become collectible when nothing references it.

From there we'll look at how ShadowRealm's separate module graphs, SES
Compartments' capability model, and Node's loader APIs point toward
server-side federation that can update, drain, and clean up after itself —
including AI Mini Apps that need independent deployment without inheriting the
whole process.
