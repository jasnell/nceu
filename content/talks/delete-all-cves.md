---
title: Delete all CVEs
speaker: Mikola Lysenko
speakerId: mikola-lysenko
---

To secure their open source dependencies today, developers face an impossible
choice. As AI increases attackers' capabilities, the pressure to fix vulnerable
dependencies fast has never been higher, but reckless updates bring broken
builds, production incidents, performance regressions, and worst of all
malware. Update slowly behind cooldowns and stay exposed to known
vulnerabilities; update aggressively and walk straight into poisoned releases.
There's no good answer.

Instead of trying to build some contrived "smart updater" agent, we asked a
different question: suppose you never want to update your dependencies — what
would it actually take to delete every CVE? Can we produce a correct, minimal,
behavior-preserving fix for every version of every vulnerable package, for
every vulnerability ever published?

The answer turns out to be less a clever trick than an economics problem. I'll
give an overview of how we're attacking this problem at Socket, how we're
working to get these patches deployed across the broader open source ecosystem,
and why we think it's only going to get worse as AI models continue to improve.
Along the way I'll tell you how our system evolved, which of our initial ideas
did not survive contact with reality, and what we ended up actually shipping.
