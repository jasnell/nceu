/**
 * Tests for the content integrity checks.
 *
 * The real content must pass; the rest of the cases break the content graph on
 * purpose in a temporary fixture, because a checker that never fails is worse
 * than no checker at all.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateContent } from "../scripts/check-content.ts";

/** A minimal but valid content tree: one speaker, one talk, one program day. */
function makeFixture(overrides: {
  speakers?: Record<string, string>;
  talks?: Record<string, string>;
  program?: string;
  photos?: string[];
} = {}) {
  const dir = mkdtempSync(join(tmpdir(), "nceu-content-"));
  mkdirSync(join(dir, "content/speakers"), { recursive: true });
  mkdirSync(join(dir, "content/talks"), { recursive: true });
  mkdirSync(join(dir, "public/speakers"), { recursive: true });

  const speakers = overrides.speakers ?? {
    "ada-lovelace": `---\nname: Ada Lovelace\nrole: Engineer\n---\n\nA bio.\n`,
  };
  const talks = overrides.talks ?? {
    "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ada-lovelace\n---\n\nAn abstract.\n`,
  };
  const program =
    overrides.program ??
    `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        end: "09:30"\n        type: talk\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        talkId: analytical-engine\n`;

  for (const [id, body] of Object.entries(speakers)) {
    writeFileSync(join(dir, `content/speakers/${id}.md`), body);
  }
  for (const [id, body] of Object.entries(talks)) {
    writeFileSync(join(dir, `content/talks/${id}.md`), body);
  }
  for (const photo of overrides.photos ?? []) {
    writeFileSync(join(dir, "public", photo), "");
  }
  writeFileSync(join(dir, "content/program.yaml"), program);

  return dir;
}

function errorsFor(overrides: Parameters<typeof makeFixture>[0]) {
  const dir = makeFixture(overrides);
  try {
    return validateContent(dir).errors;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const matching = (errors: string[], fragment: string) =>
  errors.filter((e) => e.includes(fragment));

describe("the real site content", () => {
  test("has no errors", () => {
    const { errors } = validateContent();
    assert.deepEqual(errors, []);
  });
});

describe("a valid fixture", () => {
  test("passes", () => {
    assert.deepEqual(errorsFor({}), []);
  });
});

describe("broken references are caught", () => {
  test("a talkId with no talk file", () => {
    const errors = errorsFor({
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        type: talk\n        title: The Analytical Engine\n        talkId: does-not-exist\n`,
    });
    assert.ok(matching(errors, 'talkId "does-not-exist"').length > 0, errors.join("\n"));
  });

  test("a speakerId with no speaker file", () => {
    const errors = errorsFor({
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ghost\n---\n\nAn abstract.\n`,
      },
    });
    assert.ok(matching(errors, 'speakerId "ghost"').length > 0, errors.join("\n"));
  });

  test("a talk no session points at is unreachable", () => {
    const errors = errorsFor({
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ada-lovelace\n---\n\nAn abstract.\n`,
        orphan: `---\ntitle: Orphan\nspeakerId: ada-lovelace\n---\n\nUnreferenced.\n`,
      },
    });
    assert.ok(matching(errors, "unreachable").length > 0, errors.join("\n"));
  });

  test("a photo that is not in public/", () => {
    const errors = errorsFor({
      speakers: {
        "ada-lovelace": `---\nname: Ada Lovelace\nphoto: /speakers/missing.jpg\n---\n\nA bio.\n`,
      },
    });
    assert.ok(matching(errors, "does not exist in public/").length > 0, errors.join("\n"));
  });

  test("a photo that is in public/ passes", () => {
    const errors = errorsFor({
      speakers: {
        "ada-lovelace": `---\nname: Ada Lovelace\nphoto: /speakers/ada.jpg\n---\n\nA bio.\n`,
      },
      photos: ["speakers/ada.jpg"],
    });
    assert.deepEqual(errors, []);
  });
});

describe("content drift is caught", () => {
  test("a program title that disagrees with the talk file", () => {
    const errors = errorsFor({
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        type: talk\n        title: A Different Title\n        speakerId: ada-lovelace\n        talkId: analytical-engine\n`,
    });
    assert.ok(matching(errors, "title differs").length > 0, errors.join("\n"));
  });

  test("a session speakerId that disagrees with the talk file", () => {
    const errors = errorsFor({
      speakers: {
        "ada-lovelace": `---\nname: Ada Lovelace\n---\n\nA bio.\n`,
        "charles-babbage": `---\nname: Charles Babbage\n---\n\nA bio.\n`,
      },
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        type: talk\n        title: The Analytical Engine\n        speakerId: charles-babbage\n        talkId: analytical-engine\n`,
    });
    assert.ok(matching(errors, "differs from content/talks").length > 0, errors.join("\n"));
  });

  test("the same talk used twice, which would duplicate an anchor", () => {
    const errors = errorsFor({
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        end: "09:30"\n        type: talk\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        talkId: analytical-engine\n      - start: "10:00"\n        end: "10:30"\n        type: talk\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        talkId: analytical-engine\n`,
    });
    assert.ok(matching(errors, "anchors must be unique").length > 0, errors.join("\n"));
  });
});

describe("co-presented talks", () => {
  const twoSpeakers = {
    "ada-lovelace": `---\nname: Ada Lovelace\n---\n\nA bio.\n`,
    "charles-babbage": `---\nname: Charles Babbage\n---\n\nA bio.\n`,
  };

  test("a talk and session listing the same co-speaker passes", () => {
    const errors = errorsFor({
      speakers: twoSpeakers,
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ada-lovelace\ncoSpeakerIds:\n  - charles-babbage\n---\n\nAn abstract.\n`,
      },
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        type: talk\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        coSpeakerIds:\n          - charles-babbage\n        talkId: analytical-engine\n`,
    });
    assert.deepEqual(errors, []);
  });

  test("a co-speaker with no speaker file", () => {
    const errors = errorsFor({
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ada-lovelace\ncoSpeakerIds:\n  - ghost\n---\n\nAn abstract.\n`,
      },
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        type: talk\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        coSpeakerIds:\n          - ghost\n        talkId: analytical-engine\n`,
    });
    assert.ok(matching(errors, 'coSpeakerIds entry "ghost"').length > 0, errors.join("\n"));
  });

  test("a co-speaker listed on the talk but not on the session", () => {
    const errors = errorsFor({
      speakers: twoSpeakers,
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ada-lovelace\ncoSpeakerIds:\n  - charles-babbage\n---\n\nAn abstract.\n`,
      },
    });
    assert.ok(matching(errors, "coSpeakerIds []").length > 0, errors.join("\n"));
  });

  test("a co-speaker who is also the speaker", () => {
    const errors = errorsFor({
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ada-lovelace\ncoSpeakerIds:\n  - ada-lovelace\n---\n\nAn abstract.\n`,
      },
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        type: talk\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        coSpeakerIds:\n          - ada-lovelace\n        talkId: analytical-engine\n`,
    });
    assert.ok(matching(errors, "already the speaker").length > 0, errors.join("\n"));
  });

  test("coSpeakerIds that is not a list", () => {
    const errors = errorsFor({
      speakers: twoSpeakers,
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ada-lovelace\ncoSpeakerIds: charles-babbage\n---\n\nAn abstract.\n`,
      },
    });
    assert.ok(matching(errors, "must be a list of speaker ids").length > 0, errors.join("\n"));
  });
});

describe("schedule mistakes are caught", () => {
  test("a session that ends before it starts", () => {
    const errors = errorsFor({
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        end: "08:30"\n        type: talk\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        talkId: analytical-engine\n`,
    });
    assert.ok(matching(errors, "not after").length > 0, errors.join("\n"));
  });

  test("sessions listed out of chronological order", () => {
    const errors = errorsFor({
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "14:00"\n        end: "14:30"\n        type: talk\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        talkId: analytical-engine\n      - start: "09:00"\n        end: "09:30"\n        type: break\n        title: Coffee\n`,
    });
    assert.ok(matching(errors, "out of order").length > 0, errors.join("\n"));
  });

  test("an unknown session type", () => {
    const errors = errorsFor({
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        type: keynote\n        title: The Analytical Engine\n        speakerId: ada-lovelace\n        talkId: analytical-engine\n`,
    });
    assert.ok(matching(errors, "must be one of").length > 0, errors.join("\n"));
  });
});

describe("silently-dropped fields are caught", () => {
  test("a link key the speakers page does not render", () => {
    const errors = errorsFor({
      speakers: {
        "ada-lovelace": `---\nname: Ada Lovelace\nlinks:\n  mastodon: https://example.social/@ada\n---\n\nA bio.\n`,
      },
    });
    assert.ok(matching(errors, "not rendered by the speakers page").length > 0, errors.join("\n"));
  });

  test("a talk with no abstract", () => {
    const errors = errorsFor({
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: ada-lovelace\n---\n`,
      },
    });
    assert.ok(matching(errors, "no abstract").length > 0, errors.join("\n"));
  });

  test("a speaker id that would not work as a URL anchor", () => {
    const errors = errorsFor({
      speakers: {
        Ada_Lovelace: `---\nname: Ada Lovelace\n---\n\nA bio.\n`,
      },
      talks: {
        "analytical-engine": `---\ntitle: The Analytical Engine\nspeakerId: Ada_Lovelace\n---\n\nAn abstract.\n`,
      },
      program: `title: Program\ndays:\n  - date: "2026-09-29"\n    label: Day One\n    sessions:\n      - start: "09:00"\n        type: talk\n        title: The Analytical Engine\n        speakerId: Ada_Lovelace\n        talkId: analytical-engine\n`,
    });
    assert.ok(matching(errors, "must be kebab-case").length > 0, errors.join("\n"));
  });
});
