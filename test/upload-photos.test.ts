/**
 * Tests for the photo upload script's pieces that don't need the network:
 * request signing (against AWS's published SigV4 example) and the mapping
 * from local files to bucket keys.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectFiles, objectName, signRequest } from "../scripts/upload-photos.ts";

describe("signRequest", () => {
  // "Example: GET Object" from the Amazon S3 SigV4 header-auth docs.
  test("matches the AWS reference signature", () => {
    const headers = signRequest({
      method: "GET",
      url: "https://examplebucket.s3.amazonaws.com/test.txt",
      headers: { Range: "bytes=0-9" },
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      region: "us-east-1",
      service: "s3",
      amzDate: "20130524T000000Z",
      payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    });
    assert.equal(
      headers.authorization,
      "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, " +
        "SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, " +
        "Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41",
    );
  });
});

describe("objectName", () => {
  const PHOTO_KEY = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|webp)$/;

  test("keeps ordinary camera names", () => {
    assert.equal(objectName("/x/DSC_0001.jpg"), "DSC_0001.jpg");
  });

  test("lower-cases the extension", () => {
    assert.equal(objectName("IMG_0042.JPG"), "IMG_0042.jpg");
  });

  test("replaces spaces, accents and other characters", () => {
    const name = objectName("/Export/Día 1 – keynote (3).jpeg");
    assert.equal(name, "Dia-1-keynote-3.jpeg");
    assert.match(name, PHOTO_KEY);
  });

  test("strips leading punctuation", () => {
    assert.match(objectName("__ (copy).png"), PHOTO_KEY);
  });
});

describe("collectFiles", () => {
  test("expands folders to their image files, sorted, ignoring others", () => {
    const dir = mkdtempSync(join(tmpdir(), "nceu-photos-"));
    try {
      for (const f of ["b.jpg", "a.JPEG", "notes.txt", "c.webp"]) writeFileSync(join(dir, f), "");
      mkdirSync(join(dir, "nested"));
      writeFileSync(join(dir, "nested", "d.jpg"), "");
      assert.deepEqual(
        collectFiles([dir]).map((f) => f.slice(dir.length + 1)),
        ["a.JPEG", "b.jpg", "c.webp"],
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("rejects files that are not photos", () => {
    const dir = mkdtempSync(join(tmpdir(), "nceu-photos-"));
    try {
      writeFileSync(join(dir, "notes.txt"), "");
      assert.throws(() => collectFiles([join(dir, "notes.txt")]), /Not a JPEG/);
      assert.throws(() => collectFiles([join(dir, "missing.jpg")]), /No such file/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
