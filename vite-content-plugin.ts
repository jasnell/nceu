import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { marked } from "marked";
import type { Plugin } from "vite";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * Build-time loader for content files.
 *
 * - `*.yaml` / `*.yml` are parsed and inlined as a plain JS object.
 * - `*.md` files are split into YAML frontmatter + body; the body is rendered
 *   to HTML with `marked`. The default export is `{ ...frontmatter, html }`.
 *
 * Everything happens during the Vite build, so the worker bundle ships plain
 * data and pre-rendered HTML — no YAML or Markdown parser runs at request time.
 */
export function contentPlugin(): Plugin {
  return {
    name: "nceu-content",
    enforce: "pre",
    load(id) {
      const [file] = id.split("?");

      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        const data = parseYaml(readFileSync(file, "utf8"));
        return `export default ${JSON.stringify(data)};`;
      }

      if (file.endsWith(".md")) {
        const raw = readFileSync(file, "utf8");
        const match = raw.match(FRONTMATTER);
        const frontmatter = match ? parseYaml(match[1]) ?? {} : {};
        const body = match ? match[2] : raw;
        const html = marked.parse(body, { async: false }) as string;
        return `export default ${JSON.stringify({ ...frontmatter, html })};`;
      }

      return null;
    },
  };
}
