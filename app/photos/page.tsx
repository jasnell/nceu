"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { SiteFooter, SiteHeader, useTheme } from "../shared";
import justifiedLayout from "./justified-layout";

type ImageVariant = { src: string; width: number; height: number };
type Photo = { thumb: ImageVariant; full: ImageVariant };

// The grid thumbnail is resized to 600x600 at build time by vite-imagetools.
const thumbModules = import.meta.glob<{ default: ImageVariant }>(
  "../../content/photos/*/*.jpg",
  {
    eager: true,
    query: { w: "400", h: "400", fit: "inside", format: "jpeg", as: "metadata" },
  },
);

// The lightbox uses the original, unresized photo; only its dimensions are
// read at build time (required by PhotoSwipe to size the slide upfront).
const fullUrlModules = import.meta.glob<{ default: string }>(
  "../../content/photos/*/*.jpg",
  { eager: true },
);

const dimensionModules = import.meta.glob<{ default: { width: number; height: number } }>(
  "../../content/photos/*/*.jpg",
  { eager: true, query: "?dimensions" },
);

// Keyed by folder name — the same key used to join in each album's metadata
// below, so renaming a folder can't leave the two out of sync.
const photosByAlbum: Record<string, Photo[]> = {};
for (const path of Object.keys(thumbModules).sort()) {
  const folder = path.split("/").at(-2)!;
  const { width, height } = dimensionModules[path].default;
  (photosByAlbum[folder] ??= []).push({
    thumb: thumbModules[path].default,
    full: { src: fullUrlModules[path].default, width, height },
  });
}

type AlbumMeta = { date: string; title: string; weekday?: string };

// Each album folder's `_album.md` frontmatter names and dates that album.
const albumModules = import.meta.glob<{ default: AlbumMeta }>(
  "../../content/photos/*/_album.md",
  { eager: true },
);

const pad = (n: number) => String(n).padStart(2, "0");

// Scales from 130px at a 300px-wide container up to 200px at 1100px, clamped
// outside that range.
function rowHeightFor(containerWidth: number): number {
  const t = (containerWidth - 300) / (1100 - 300);
  return 130 + Math.min(Math.max(t, 0), 1) * (200 - 130);
}

const albums = Object.entries(albumModules)
  .map(([path, mod]) => ({ folder: path.split("/").at(-2)!, ...mod.default }))
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((album, i) => ({ ...album, index: pad(i + 1) }));

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PhotoGrid({ photos, albumTitle }: { photos: Photo[]; albumTitle: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [spacing, setSpacing] = useState(0);

  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
      // Mirrors the `clamp(0.6rem, 1.6vw, 1rem)` grid gap used elsewhere on the site.
      setSpacing(Math.min(Math.max(0.016 * window.innerWidth, 9.6), 16));
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    window.addEventListener("orientationchange", updateLayout);
    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("orientationchange", updateLayout);
    };
  }, []);

  const layout = useMemo(() => {
    if (containerWidth === 0 || photos.length === 0) return null;

    return justifiedLayout(
      photos.map(({ thumb }) => thumb.width / thumb.height),
      {
        rowWidth: containerWidth,
        spacing,
        rowHeight: rowHeightFor(containerWidth),
        heightTolerance: 0.25,
      },
    );
  }, [containerWidth, spacing, photos]);

  return (
    <div
      className="photo-grid"
      ref={containerRef}
      style={{ height: layout?.containerHeight }}
    >
      {layout?.boxes.map((box, i) => {
        const { thumb, full } = photos[i];
        return (
          <a
            key={thumb.src}
            className="photo-item"
            href={full.src}
            data-pswp-width={full.width}
            data-pswp-height={full.height}
            style={{
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
            }}
          >
            <img
              className="photo-thumb"
              src={thumb.src}
              width={thumb.width}
              height={thumb.height}
              alt={`${albumTitle} photo ${i + 1}`}
              loading="lazy"
              decoding="async"
            />
          </a>
        );
      })}
    </div>
  );
}

export default function PhotosPage() {
  const { theme, setTheme } = useTheme();
  const visibleAlbums = albums.filter(
    (album) => (photosByAlbum[album.folder] ?? []).length > 0,
  );

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: ".photos-gallery",
      children: "a",
      bgOpacity: 1,
      zoom: false,
      showHideAnimationType: "zoom",
      imageClickAction: "close",
      pswpModule: () => import("photoswipe"),
      paddingFn: (viewportSize) => ({
        top: 60,
        bottom: 60,
        left: viewportSize.x > 1024 ? 75 : 0,
        right: viewportSize.x > 1024 ? 75 : 0
      })
    });
    lightbox.init();
    return () => lightbox.destroy();
  }, []);

  return (
    <div className="page-shell photos-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <SiteHeader theme={theme} setTheme={setTheme} />

      <main id="main-content" tabIndex={-1}>
        <section className="photos-masthead" aria-labelledby="photos-title">
          <p className="kicker">NodeConf EU 2026 · Photos</p>
          <h1 className="photos-title" id="photos-title">
            Photos
          </h1>
          <p className="photos-lede">
            Photos from the stage and the hallway track, added day by day as
            NodeConf EU 2026 unfolds in Bologna — check back during the event
            for the latest shots.
          </p>

          <nav className="photos-jump" aria-label="Jump to album">
            {visibleAlbums.map((album, i) => (
              <a key={album.folder} href={`#day${i + 1}`}>
                {album.index} / {album.title}
              </a>
            ))}
          </nav>
        </section>

        <div className="photos-gallery">
          {visibleAlbums.map((album, i) => (
            <section
              key={album.folder}
              id={`day${i + 1}`}
              className="photos-album"
              aria-label={`${album.title} photos`}
            >
              <header className="photos-album-head">
                <span className="photos-album-index" aria-hidden="true">
                  {album.index}
                </span>
                <div className="photos-album-meta">
                  <h2 className="photos-album-name">{album.title}</h2>
                  <p className="photos-album-date">
                    {album.weekday} · {formatDate(album.date)}
                  </p>
                </div>
              </header>

              <PhotoGrid photos={photosByAlbum[album.folder]} albumTitle={album.title} />
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
