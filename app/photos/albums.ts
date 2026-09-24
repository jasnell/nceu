// Photo albums, declared by `content/photos/<date>/_album.md`. The folder name
// is also the album's key prefix in the PHOTOS bucket; a prefix without an
// `_album.md` is never shown. Shared by /photos and /photos/pick.json.

export type AlbumMeta = {
  folder: string;
  date: string;
  title: string;
  weekday?: string;
  /** "01", "02"… in date order. */
  index: string;
  /** Credited on the album, on each photo in the lightbox, and in the app. */
  photographer?: string;
  photographerUrl?: string;
};

const albumModules = import.meta.glob<{
  default: Omit<AlbumMeta, "folder" | "index">;
}>("../../content/photos/*/_album.md", { eager: true });

const pad = (n: number) => String(n).padStart(2, "0");

export const albums: AlbumMeta[] = Object.entries(albumModules)
  .map(([path, mod]) => ({ folder: path.split("/").at(-2)!, ...mod.default }))
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((album, i) => ({ ...album, index: pad(i + 1) }));
