import { env } from "cloudflare:workers";
import { after } from "next/server";
import { THUMB_SIZE, edgeCache, imageCacheControl, isPhotoKey } from "../../photo-store";

export const dynamic = "force-dynamic";

/**
 * Serves a grid thumbnail. The first request resizes the original through the
 * IMAGES binding and stores the result in R2 under `_thumbs/`, keyed by the
 * original's etag, so each photo is only transformed once.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<Response> {
  const key = (await params).key.join("/");
  if (!isPhotoKey(key)) return new Response("Not found", { status: 404 });

  const cache = edgeCache();
  // Keyed on the URL alone; `?v=<etag>` already distinguishes versions.
  const cacheKey = new Request(request.url);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const original = await env.PHOTOS.head(key);
  if (!original) return new Response("Not found", { status: 404 });

  const thumbKey = `_thumbs/${THUMB_SIZE}/${key}.${original.etag}.webp`;
  let body: ReadableStream | ArrayBuffer;
  const stored = await env.PHOTOS.get(thumbKey);
  if (stored) {
    body = stored.body;
  } else {
    const source = await env.PHOTOS.get(key);
    if (!source) return new Response("Not found", { status: 404 });
    const result = await env.IMAGES.input(source.body)
      .transform({ width: THUMB_SIZE, height: THUMB_SIZE, fit: "scale-down" })
      .output({ format: "image/webp", quality: 80 });
    body = await result.response().arrayBuffer();
    after(
      env.PHOTOS.put(thumbKey, body, { httpMetadata: { contentType: "image/webp" } }),
    );
  }

  const response = new Response(body, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": imageCacheControl(request, original.etag),
      ETag: `"${original.etag}-${THUMB_SIZE}"`,
    },
  });
  after(cache.put(cacheKey, response.clone()));
  return response;
}
