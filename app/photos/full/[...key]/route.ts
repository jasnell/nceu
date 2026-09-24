import { env } from "cloudflare:workers";
import { after } from "next/server";
import { edgeCache, imageCacheControl, isPhotoKey } from "../../photo-store";

export const dynamic = "force-dynamic";

/** 304 when the browser already holds this version of the photo. */
function notModified(request: Request, response: Response): Response | null {
  const etag = response.headers.get("ETag");
  const ifNoneMatch = request.headers.get("If-None-Match");
  if (!etag || !ifNoneMatch) return null;
  const matches = ifNoneMatch
    .split(",")
    .some((tag) => tag.trim().replace(/^W\//, "") === etag || tag.trim() === "*");
  if (!matches) return null;
  const headers = new Headers(response.headers);
  headers.delete("Content-Length");
  return new Response(null, { status: 304, headers });
}

/**
 * Streams an original photo from R2, untouched, for the lightbox. Worker
 * responses aren't cached by the CDN on their own, so the photo is put into
 * the edge cache and later views in that location skip R2 entirely.
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
  if (cached) return notModified(request, cached) ?? cached;

  const object = await env.PHOTOS.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Content-Length", String(object.size));
  headers.set("Cache-Control", imageCacheControl(request, object.etag));

  const response = new Response(object.body, { headers });
  after(cache.put(cacheKey, response.clone()));
  return notModified(request, response) ?? response;
}
