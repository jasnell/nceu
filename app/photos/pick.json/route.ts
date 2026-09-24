import { type AlbumMeta, albums } from "../albums";
import { type Photo, listAlbum } from "../photo-store";

export const dynamic = "force-dynamic";

export type PickedPhoto = {
  photo: Photo;
  album: Pick<AlbumMeta, "title" | "weekday" | "date" | "photographer" | "photographerUrl">;
};

/**
 * One photo for the attendee app's "From the photo wall" card:
 * `?mode=latest` (default) is the most recently uploaded, `?mode=random` any
 * of them. Responds `{ photo: null }` when no album has photos yet.
 *
 * Album listings are edge-cached for a minute by `listAlbum`, so this adds
 * little R2 traffic however often the app asks.
 */
export async function GET(request: Request): Promise<Response> {
  const mode = new URL(request.url).searchParams.get("mode") === "random" ? "random" : "latest";

  const all = (
    await Promise.all(
      albums.map(async (album) => {
        try {
          const photos = await listAlbum(album.folder);
          return photos.map((photo) => ({
            photo,
            album: {
              title: album.title,
              weekday: album.weekday,
              date: album.date,
              photographer: album.photographer,
              photographerUrl: album.photographerUrl,
            },
          }));
        } catch (error) {
          console.error(`photos: could not list album ${album.folder}`, error);
          return [];
        }
      }),
    )
  ).flat();

  let picked: PickedPhoto | null = null;
  if (all.length > 0) {
    picked =
      mode === "random"
        ? all[Math.floor(Math.random() * all.length)]
        : all.reduce((a, b) => ((b.photo.uploaded ?? "") > (a.photo.uploaded ?? "") ? b : a));
  }

  return Response.json(picked ?? { photo: null }, {
    headers: {
      // Latest changes at most as often as the listing cache; random must not repeat.
      "Cache-Control": mode === "random" ? "no-store" : "public, max-age=60",
    },
  });
}
