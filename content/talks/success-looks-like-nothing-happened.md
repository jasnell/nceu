---
title: Success Looks Like Nothing Happened
speaker: Marina Ionel
speakerId: marina-ionel
---

Success on a high-stakes assessment platform doesn't always look like a feature
launch. It can look like nothing happening at all.

When I joined WISEflow, our frontend estate had no shared Node tooling: jQuery,
AngularJS, and a growing React monolith, each built and deployed its own way,
with no real way to know what was breaking beyond user complaints. Getting
buy-in meant making one promise to management — modernizing wouldn't slow down
feature delivery. It didn't; it sped it up.

I standardized dozens of independently deployed React frontends onto the same
Node-based build stack: Vite for builds and dev servers, Biome for linting and
formatting, cutting CI time 2–3×, while every component was rewritten
functional with modern data-fetching and error tracking scoped narrowly enough
to respect student data law. Between the shared tooling, adopting AI-assisted
development, and training the team to use both, merged PRs more than doubled —
with a smaller team than when we started.

All of it shipped to 150 institutions in 14 countries, 4.1 million exams a
year, up to 90,000 people testing at once, without a single participant
noticing a thing. This talk is that playbook: the Node tooling decisions that
let a small team modernize dozens of production frontends without slowing
feature delivery, and how to prove it paid off.
