/**
 * Uploads conference photos to the site's R2 bucket.
 *
 *   node scripts/upload-photos.ts 2026-09-29 ~/Export/day-one/
 *   node scripts/upload-photos.ts 2026-09-29 IMG_0001.jpg IMG_0002.jpg
 *   node scripts/upload-photos.ts --delete 2026-09-29 IMG_0002.jpg
 *
 * Photos show up on /photos within about a minute; no deploy is needed. The
 * site resizes thumbnails and reads dimensions itself, so upload the full-size
 * exports as they are.
 *
 * Credentials come from an R2 API token scoped to the bucket ("Object Read &
 * Write"), passed as environment variables or in a `.env` file in the current
 * directory:
 *
 *   R2_ACCESS_KEY_ID=…
 *   R2_SECRET_ACCESS_KEY=…
 *
 * R2_ACCOUNT_ID and R2_BUCKET default to the site's account and bucket.
 *
 * Uses only Node built-ins (Node 22.18+), so this file can be run on its own
 * without cloning the repo or installing dependencies.
 */

import { createHash, createHmac } from "node:crypto";
import { existsSync, readdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Must match wrangler.jsonc (`account_id` and the PHOTOS binding's bucket).
const DEFAULT_ACCOUNT_ID = "c90070fbe9f928f17c328c65fb3781ab";
const DEFAULT_BUCKET = "nodeconf-eu-photos";

const ALBUM = /^\d{4}-\d{2}-\d{2}$/;
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};
const CONCURRENCY = 4;
const ATTEMPTS = 3;

// ---- AWS Signature Version 4 ------------------------------------------------

export type SignInput = {
  method: string;
  url: string;
  headers: Record<string, string>;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  /** `YYYYMMDD'T'HHMMSS'Z'` */
  amzDate: string;
  /** Hex SHA-256 of the body, or `UNSIGNED-PAYLOAD`. */
  payloadHash: string;
};

const sha256Hex = (data: string) => createHash("sha256").update(data).digest("hex");
const hmac = (key: string | Buffer, data: string) => createHmac("sha256", key).update(data).digest();

/** RFC 3986 encoding, as SigV4 requires (encodeURIComponent leaves !'()* alone). */
function uriEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/** Returns the request headers plus `x-amz-date`, `x-amz-content-sha256` and `authorization`. */
export function signRequest(input: SignInput): Record<string, string> {
  const url = new URL(input.url);
  const headers: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(input.headers).map(([k, v]) => [k.toLowerCase(), v.trim()]),
    ),
    host: url.host,
    "x-amz-date": input.amzDate,
    "x-amz-content-sha256": input.payloadHash,
  };
  const names = Object.keys(headers).sort();
  const signedHeaders = names.join(";");

  const canonicalUri = url.pathname
    .split("/")
    .map((segment) => uriEncode(decodeURIComponent(segment)))
    .join("/");
  const canonicalQuery = [...url.searchParams]
    .map(([k, v]) => [uriEncode(k), uriEncode(v)])
    .sort(([a, x], [b, y]) => (a === b ? (x < y ? -1 : 1) : a < b ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const canonicalRequest = [
    input.method,
    canonicalUri,
    canonicalQuery,
    names.map((n) => `${n}:${headers[n]}\n`).join(""),
    signedHeaders,
    input.payloadHash,
  ].join("\n");

  const day = input.amzDate.slice(0, 8);
  const scope = `${day}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", input.amzDate, scope, sha256Hex(canonicalRequest)].join("\n");
  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${input.secretAccessKey}`, day), input.region), input.service),
    "aws4_request",
  );
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  headers.authorization =
    `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return headers;
}

// ---- R2 client ----------------------------------------------------------------

type R2Config = { accountId: string; bucket: string; accessKeyId: string; secretAccessKey: string };

async function r2(
  config: R2Config,
  method: "HEAD" | "PUT" | "DELETE",
  key: string,
  body?: Uint8Array<ArrayBuffer>,
  headers: Record<string, string> = {},
): Promise<Response> {
  const url = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${key}`;
  for (let attempt = 1; ; attempt++) {
    const signed = signRequest({
      method,
      url,
      headers,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: "auto",
      service: "s3",
      amzDate: new Date().toISOString().replace(/[-:]|\.\d{3}/g, ""),
      payloadHash: "UNSIGNED-PAYLOAD",
    });
    delete signed.host; // fetch sets it
    try {
      const response = await fetch(url, { method, headers: signed, body });
      if (response.status < 500 || attempt === ATTEMPTS) return response;
    } catch (error) {
      if (attempt === ATTEMPTS) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }
}

async function failure(response: Response, what: string): Promise<Error> {
  const text = await response.text().catch(() => "");
  const code = text.match(/<Code>([^<]+)<\/Code>/)?.[1];
  const hint =
    response.status === 401 || response.status === 403
      ? " — check R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY"
      : "";
  return new Error(`${what}: HTTP ${response.status}${code ? ` ${code}` : ""}${hint}`);
}

// ---- Files --------------------------------------------------------------------

/**
 * Turns a camera/export file name into a key the site will serve: letters,
 * digits, `.`, `_` and `-` only, starting with a letter or digit, lower-case
 * extension (see PHOTO_KEY in app/photos/photo-store.ts).
 */
export function objectName(file: string): string {
  const ext = extname(file).toLowerCase();
  const stem = basename(file, extname(file))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/-+$/, "");
  if (!stem) throw new Error(`Cannot derive a file name from ${file}`);
  return `${stem}${ext}`;
}

/** Expands directories (non-recursively) and keeps supported image files, sorted. */
export function collectFiles(paths: string[]): string[] {
  const files: string[] = [];
  for (const path of paths) {
    if (!existsSync(path)) throw new Error(`No such file or directory: ${path}`);
    if (statSync(path).isDirectory()) {
      for (const entry of readdirSync(path).sort()) {
        const full = join(path, entry);
        if (statSync(full).isFile() && CONTENT_TYPES[extname(entry).toLowerCase()]) files.push(full);
      }
    } else if (CONTENT_TYPES[extname(path).toLowerCase()]) {
      files.push(path);
    } else {
      throw new Error(`Not a JPEG/PNG/WebP file: ${path}`);
    }
  }
  return files;
}

// ---- CLI ----------------------------------------------------------------------

const USAGE = `Usage:
  node scripts/upload-photos.ts [--force] [--dry-run] <album-date> <files or folders…>
  node scripts/upload-photos.ts --delete <album-date> <file names…>

  <album-date>  the conference day, e.g. 2026-09-29
  --force       re-upload files that are already in the bucket
  --dry-run     show what would happen without uploading or deleting

Needs R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY (environment or ./.env).`;

function config(): R2Config {
  if (existsSync(".env")) process.loadEnvFile(".env");
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY (environment or ./.env).");
  }
  return {
    accountId: process.env.R2_ACCOUNT_ID || DEFAULT_ACCOUNT_ID,
    bucket: process.env.R2_BUCKET || DEFAULT_BUCKET,
    accessKeyId,
    secretAccessKey,
  };
}

/** Only checkable from a repo checkout; the page lists albums that have an `_album.md`. */
function checkAlbumKnown(album: string) {
  const photosDir = fileURLToPath(new URL("../content/photos/", import.meta.url));
  if (existsSync(photosDir) && !existsSync(join(photosDir, album, "_album.md"))) {
    const known = readdirSync(photosDir).filter((d) => existsSync(join(photosDir, d, "_album.md")));
    throw new Error(
      `No album for ${album} (content/photos/${album}/_album.md) — the page would not show ` +
        `these photos. Known albums: ${known.join(", ") || "none"}.`,
    );
  }
}

async function pool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) await worker(items[next++]);
    }),
  );
}

async function main(argv: string[]) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const [album, ...paths] = argv.filter((a) => !a.startsWith("--"));
  if (flags.has("--help") || !album || paths.length === 0) {
    console.log(USAGE);
    process.exitCode = flags.has("--help") ? 0 : 1;
    return;
  }
  for (const flag of flags) {
    if (!["--force", "--dry-run", "--delete"].includes(flag)) throw new Error(`Unknown option ${flag}\n\n${USAGE}`);
  }
  if (!ALBUM.test(album)) throw new Error(`Album must be a date like 2026-09-29, got "${album}"`);
  checkAlbumKnown(album);

  const dryRun = flags.has("--dry-run");
  const cfg = config();

  if (flags.has("--delete")) {
    for (const name of paths.map(objectName)) {
      const key = `${album}/${name}`;
      if (dryRun) {
        console.log(`would delete ${key}`);
        continue;
      }
      const response = await r2(cfg, "DELETE", key);
      if (!response.ok) throw await failure(response, `delete ${key}`);
      console.log(`deleted ${key}`);
    }
    return;
  }

  const files = collectFiles(paths);
  if (files.length === 0) throw new Error("No JPEG/PNG/WebP files found.");
  const byKey = new Map<string, string>();
  for (const file of files) {
    const key = `${album}/${objectName(file)}`;
    if (byKey.has(key)) throw new Error(`${file} and ${byKey.get(key)} would both upload as ${key}`);
    byKey.set(key, file);
  }

  let uploaded = 0;
  let skipped = 0;
  const failed: string[] = [];
  await pool([...byKey], async ([key, file]) => {
    const size = statSync(file).size;
    try {
      if (!flags.has("--force")) {
        const head = await r2(cfg, "HEAD", key);
        if (head.ok && Number(head.headers.get("content-length")) === size) {
          skipped++;
          console.log(`skip    ${key} (already uploaded)`);
          return;
        }
        if (!head.ok && head.status !== 404) throw await failure(head, `check ${key}`);
      }
      if (dryRun) {
        console.log(`would upload ${file} -> ${key}`);
        return;
      }
      const type = CONTENT_TYPES[extname(file).toLowerCase()];
      const response = await r2(cfg, "PUT", key, await readFile(file), { "content-type": type });
      if (!response.ok) throw await failure(response, `upload ${key}`);
      uploaded++;
      console.log(`upload  ${key} (${(size / 1e6).toFixed(1)} MB)`);
    } catch (error) {
      failed.push(key);
      const { message, cause } = error as Error & { cause?: { message?: string } };
      console.error(`FAILED  ${key}: ${message}${cause?.message ? ` (${cause.message})` : ""}`);
    }
  });

  console.log(`\n${uploaded} uploaded, ${skipped} already there, ${failed.length} failed.`);
  if (uploaded > 0) console.log("New photos appear on https://nodeconf.eu/photos within about a minute.");
  if (failed.length > 0) {
    console.log("Re-run the same command to retry; finished files are skipped.");
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
