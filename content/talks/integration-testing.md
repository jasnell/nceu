---
title: Performant, Parallelizable, Framework Agnostic Node.js Integration Testing
speaker: Ethan Arrowood
speakerId: ethan-arrowood
---

Testing a collapsed-stack system is a fundamentally different challenge than
testing a conventional web service. Harper is an open-source, Node.js
application platform with database, networking, file system, CLI, applications
and plugins, all wrapped up into one system. Harper runs as a single process
and uses workers for parallelization — which makes it difficult to efficiently
integration test.

How do we parallelize test executions when each test requires its own Harper
process? How do we ensure these processes do not try to use conflicting HTTP
ports? How does all of this work across local dev machines, different operating
systems, and CI environments? And how can we implement all of this in a
test-framework-agnostic way?

I'll walk through the optimization research behind the default parallelization
configuration, the architecture and design principles behind the API, and two
actual framework integrations — one with the Node.js test runner, one with
Playwright. Attendees will walk away with patterns for process isolation,
dynamic port allocation, and framework-agnostic API design that apply well
beyond Harper.
