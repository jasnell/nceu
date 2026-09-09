import { readFileSync } from "node:fs";
import { imageSize } from "image-size";
import type { Plugin } from "vite";

/**
 * Reads an image's pixel dimensions at build time via `?dimensions`, without
 * decoding/re-encoding it through sharp (unlike vite-imagetools). Use this
 * when you need an image's width/height but want to ship the original file
 * untouched, e.g. for a lightbox that links to the source photo.
 */
export function imageDimensionsPlugin(): Plugin {
  return {
    name: "nceu-image-dimensions",
    enforce: "pre",
    load(id) {
      const [file, query] = id.split("?");

      if (!query || !new URLSearchParams(query).has("dimensions")) {
        return null;
      }

      const { width, height } = imageSize(readFileSync(file));
      return `export default ${JSON.stringify({ width, height })};`;
    },
  };
}
