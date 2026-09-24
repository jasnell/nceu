import { albums as albumMeta } from "./albums";
import PhotosGallery, { type Album } from "./gallery";
import { listAlbum } from "./photo-store";

// The photo list comes from R2 at request time, so uploads made during the
// conference appear without a redeploy.
export const dynamic = "force-dynamic";

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
