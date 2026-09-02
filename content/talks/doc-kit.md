---
title: "Replacing What Works: doc-kit and the Next 10 Years of Node.js Documentation"
speaker: Brian Muenzenmeyer
speakerId: brian-muenzenmeyer
coSpeakerIds:
  - claudio-wunder
---

The toolchain generating Node.js API documentation dates back to 2012 and
Node.js v0.6.x. Before the io.js fork, before npm had a lockfile, before
Node.js even had a foundation. For fourteen years it lived inside Node core,
wired into the Makefile, helping power over twenty major versions. It worked.
But "works" and "ready for the next ten years" aren't the same thing.

This talk is the story of doc-kit, the standalone, customizable tool built to
replace that pipeline. doc-kit parses, lints, and transforms markdown into an
AST that generates a dozen output formats from a single CLI command:
redesigned web pages, pixel-perfect legacy HTML, man pages, JSON schemas,
search indices, and llms.txt for AI. And it'll output whatever comes next.

You'll also hear the human side of maintaining critical open source
infrastructure responsibly: the patience required to build consensus across
contributors, the discipline of shipping backward compatibility before
ambitions, and how to balance the needs of machines, contributors, and the
millions of developers who read these docs every day.
