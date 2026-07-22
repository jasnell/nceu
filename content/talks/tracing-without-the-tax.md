---
title: Tracing Without the Tax
speaker: Abdelrahman Awad
speakerId: abdelrahman-awad
---

JavaScript framework authors face a brutal tradeoff when it comes to
observability: either ship "blind" code and rely on third parties to brittlely
monkey-patch your API, or bloat your bundle with heavy observability
dependencies. Both options hurt developer experience and performance.

Tracing channels changed this — a native, zero-dependency pattern that allows
frameworks to emit events that are contextualized and execution-correlated end
to end. In this session, I'll show how tracing channels enable open
observability APIs that progressively enhance with newer Node.js versions and
gracefully degrade with zero overhead.

We are leading an initiative to get libraries to adopt tracing channels, so
we'll look at the top libraries and frameworks that have adopted it so far and
what it means for APMs, users, and observability. The instrumentation tax no
longer has to be paid.
