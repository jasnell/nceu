import PhotosGallery, { type Album } from "./gallery";
import { listAlbum } from "./photo-store";

// The photo list comes from R2 at request time, so uploads made during the
// conference appear without a redeploy.
export const dynamic = "force-dynamic";

type AlbumMeta = { date: string; title: string; weekday?: string };

// Each album's `_album.md` frontmatter names and dates it; the folder name is
// also the album's key prefix in the PHOTOS bucket.
const albumModules = import.meta.glob<{ default: AlbumMeta }>(
  "../../content/photos/*/_album.md",
  { eager: true },
);

const pad = (n: number) => String(n).padStart(2, "0");

const albumMeta = Object.entries(albumModules)
  .map(([path, mod]) => ({ folder: path.split("/").at(-2)!, ...mod.default }))
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((album, i) => ({ ...album, index: pad(i + 1) }));

export default async function PhotosPage() {
  const albums: Album[] = await Promise.all(
    albumMeta.map(async (album) => {
      try {
        return { ...album, photos: await listAlbum(album.folder) };
      } catch (error) {
        // Degrade to an empty album rather than failing the whole page.
        console.error(`photos: could not list album ${album.folder}`, error);
        return { ...album, photos: [] };
      }
    }),
  );

  return <PhotosGallery albums={albums} />;
}
