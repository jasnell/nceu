---
title: diagnostics_channel Deserves Better
speaker: Lois Zhao
speakerId: lois-zhao
---

Today's Node.js APM tooling is built on monkey-patching. Sentry,
OpenTelemetry, dd-trace — they all reach into libraries from the outside,
mutating `require()` cache entries to inject observability. This is fragile,
ESM-hostile, and breaks every time a library refactors.

`diagnostics_channel` flips the model: libraries become active participants in
their own observability, emitting structured events that any APM can subscribe
to. No monkey-patching. No vendor-specific hooks. One shared bus.
