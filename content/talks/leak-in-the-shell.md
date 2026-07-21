---
title: A Leak in the Shell — How Refactoring Autocomplete Broke Us and How We Fixed It
speaker: Anna Henningsen
speakerId: anna-henningsen
---

Improving the autocomplete in MongoDB's database CLI seemed like a great idea.
But when the team tried to flip the feature flag, things quickly started to go
sideways: a story of memory leaks, bugs that touch the very core of JavaScript
as a language, and hard-learned lessons about testing and performance.
