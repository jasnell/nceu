/**
 * Server-only access to the conference photos in the PHOTOS R2 bucket.
 *
 * Bucket layout:
 *   <album date>/<file>.jpg            originals, uploaded by organisers
 *   _index/<album date>.json           cached pixel dimensions, keyed by etag
 *   _thumbs/<size>/<key>.<etag>.webp   grid thumbnails made by the IMAGES binding
 *
 * Only the originals are uploaded by hand (scripts/upload-photos.ts, the
 * dashboard, rclone…). Dimensions and thumbnails are derived lazily on first
 * request, so a photo appears on the page as soon as it lands in the bucket.
 */
import { env } from "cloudflare:workers";
import { imageSize } from "image-size";
import { after } from "next/server";

export type ImageVariant = { src: string; width: number; height: number };
export type Photo = {
  thumb: ImageVariant;
  full: ImageVariant;
  /** When the original landed in R2 (ISO 8601); used to find the latest photo. */
  uploaded?: string;
};

/** Longest edge of the grid thumbnails, in pixels. */
export const THUMB_SIZE = 600;

// Albums are named by date; restricting file names keeps URLs unescaped and
// stops the image routes from serving the derived `_index/` / `_thumbs/` keys.
const PHOTO_KEY = /^\d{4}-\d{2}-\d{2}\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|webp)$/i;

export function isPhotoKey(key: string): boolean {
  return PHOTO_KEY.test(key);
}

type Dimensions = { etag: string; width: number; height: number };
type DimensionIndex = Record<string, Dimensions>;

// JPEG headers (incl. EXIF and its embedded preview) almost always fit here;
// anything larger falls back to reading the whole object.
const HEADER_BYTES = 256 * 1024;
// Keeps a cold listing of a freshly uploaded day well inside the per-request
// subrequest limit. Unmeasured photos are picked up by the next request.
const MAX_MEASURES_PER_REQUEST = 150;
const MEASURE_CONCURRENCY = 6;
// How long a rendered album listing is reused from the edge cache.
const LISTING_TTL_SECONDS = 60;

function measure(bytes: Uint8Array): { width: number; height: number } {
  const { width, height, orientation } = imageSize(bytes);
  // EXIF orientations 5–8 are rotated by 90°; browsers honour the tag, so the
  // displayed size is the stored size swapped.
  return orientation && orientation >= 5
    ? { width: height, height: width }
    : { width, height };
}

async function measureObject(key: string, etag: string): Promise<Dimensions | null> {
  try {
    const head = await env.PHOTOS.get(key, { range: { offset: 0, length: HEADER_BYTES } });
    if (!head) return null;
    try {
      return { etag, ...measure(new Uint8Array(await head.arrayBuffer())) };
    } catch {
      const whole = await env.PHOTOS.get(key);
      if (!whole) return null;
      return { etag, ...measure(new Uint8Array(await whole.arrayBuffer())) };
    }
  } catch (error) {
    console.warn(`photos: could not read dimensions of ${key}`, error);
    return null;
  }
}

/** The Workers edge cache (the DOM lib's CacheStorage type lacks `default`). */
export function edgeCache(): Cache {
  return (caches as unknown as { default: Cache }).default;
}

function versioned(path: string, etag: string): string {
  return `${path}?v=${encodeURIComponent(etag)}`;
}

function toPhoto(key: string, { etag, width, height }: Dimensions, uploaded: string): Photo {
  const scale = Math.min(1, THUMB_SIZE / Math.max(width, height));
  return {
    thumb: {
      src: versioned(`/photos/thumb/${key}`, etag),
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    },
    full: { src: versioned(`/photos/full/${key}`, etag), width, height },
    uploaded,
  };
}

async function listAlbumFromBucket(album: string): Promise<Photo[]> {
  const keys: { key: string; etag: string; uploaded: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.PHOTOS.list({ prefix: `${album}/`, cursor });
    for (const { key, etag, uploaded } of page.objects) {
      if (isPhotoKey(key)) keys.push({ key, etag, uploaded: uploaded.toISOString() });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  keys.sort((a, b) => a.key.localeCompare(b.key));

  const indexKey = `_index/${album}.json`;
  const stored = await env.PHOTOS.get(indexKey);
  const index: DimensionIndex = stored ? await stored.json() : {};

  const missing = keys
    .filter(({ key, etag }) => index[key]?.etag !== etag)
    .slice(0, MAX_MEASURES_PER_REQUEST);
  const measured: DimensionIndex = {};
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(MEASURE_CONCURRENCY, missing.length) }, async () => {
      while (next < missing.length) {
        const { key, etag } = missing[next++];
        const dimensions = await measureObject(key, etag);
        if (dimensions) measured[key] = dimensions;
      }
    }),
  );

  const updated: DimensionIndex = {};
  const photos: Photo[] = [];
  for (const { key, etag, uploaded } of keys) {
    const dimensions = measured[key] ?? (index[key]?.etag === etag ? index[key] : undefined);
    if (!dimensions) continue;
    updated[key] = dimensions;
    photos.push(toPhoto(key, dimensions, uploaded));
  }

  // Rewrite the index when photos were measured, replaced or deleted. Two
  // concurrent writers produce the same content, so the race is harmless.
  const changed =
    Object.keys(measured).length > 0 ||
    Object.keys(updated).length !== Object.keys(index).length;
  if (changed) {
    after(
      env.PHOTOS.put(indexKey, JSON.stringify(updated), {
        httpMetadata: { contentType: "application/json" },
      }),
    );
  }

  return photos;
}

/**
 * Photos of one album, sorted by file name. Served from the edge cache for
 * up to a minute so page views don't each list the bucket.
 */
export async function listAlbum(album: string): Promise<Photo[]> {
  const cache = edgeCache();
  const cacheKey = new Request(`https://photos.cache.internal/albums/${album}`);
  const cached = await cache.match(cacheKey);
  if (cached) return cached.json();

  const photos = await listAlbumFromBucket(album);
  after(
    cache.put(
      cacheKey,
      Response.json(photos, {
        headers: { "Cache-Control": `public, max-age=${LISTING_TTL_SECONDS}` },
      }),
    ),
  );
  return photos;
}

/** Cache headers for an image response. `?v=<etag>` URLs never change. */
export function imageCacheControl(request: Request, etag: string): string {
  const version = new URL(request.url).searchParams.get("v");
  return version === etag
    ? "public, max-age=31536000, immutable"
    : "public, max-age=300";
}
