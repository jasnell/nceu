"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { SiteFooter, SiteHeader, externalLinkProps, useTheme } from "../shared";
import justifiedLayout from "./justified-layout";
import type { AlbumMeta } from "./albums";
import type { Photo } from "./photo-store";

export type Album = AlbumMeta & { photos: Photo[] };

// Scales from 130px at a 300px-wide container up to 200px at 1100px, clamped
// outside that range.
function rowHeightFor(containerWidth: number): number {
  const t = (containerWidth - 300) / (1100 - 300);
  return 130 + Math.min(Math.max(t, 0), 1) * (200 - 130);
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PhotoGrid({ photos, album }: { photos: Photo[]; album: AlbumMeta }) {
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
            data-credit-name={album.photographer}
            data-credit-url={album.photographerUrl}
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
              alt={`${album.title} photo ${i + 1}`}
              loading="lazy"
              decoding="async"
            />
          </a>
        );
      })}
    </div>
  );
}

export default function PhotosGallery({ albums }: { albums: Album[] }) {
  const { theme, setTheme } = useTheme();
  const visibleAlbums = albums.filter((album) => album.photos.length > 0);

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: ".photos-gallery",
      // Only the grid's photo links: the gallery also holds album headers
      // (e.g. the photographer credit link), which must stay normal links.
      children: "a.photo-item",
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
    // Credits the photographer of the photo on screen (from the grid link's
    // data-credit-* attributes), so a shared screenshot carries the name.
    lightbox.on("uiRegister", () => {
      lightbox.pswp?.ui?.registerElement({
        name: "credit",
        order: 9,
        isButton: false,
        appendTo: "root",
        onInit: (el, pswp) => {
          const update = () => {
            const link = pswp.currSlide?.data.element as HTMLElement | undefined;
            const name = link?.dataset.creditName;
            const url = link?.dataset.creditUrl;
            el.replaceChildren();
            el.hidden = !name;
            if (!name) return;
            el.append("Photo: ");
            if (url) {
              const a = document.createElement("a");
              a.href = url;
              a.target = "_blank";
              a.rel = "noopener noreferrer";
              a.textContent = name;
              el.appendChild(a);
            } else {
              el.append(name);
            }
          };
          pswp.on("change", update);
          update();
        },
      });
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
                  {album.photographer ? (
                    <p className="photos-album-credit">
                      Photos by{" "}
                      {album.photographerUrl ? (
                        <a
                          href={album.photographerUrl}
                          {...externalLinkProps(`${album.photographer}, photographer`)}
                        >
                          {album.photographer}
                        </a>
                      ) : (
                        album.photographer
                      )}
                    </p>
                  ) : null}
                </div>
              </header>

              <PhotoGrid photos={album.photos} album={album} />
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
