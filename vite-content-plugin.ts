import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { Marked, marked } from "marked";
import type { Plugin } from "vite";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const stripTags = (html: string) => html.replace(/<[^>]*>/g, "");

/**
 * Renders Markdown to readable plain text: markup is dropped, soft line breaks
 * are joined, paragraphs are separated by a blank line, list items keep a
 * bullet, and links keep their URL. For places that cannot show HTML.
 */
const plainText = new Marked({
  renderer: {
    space: () => "",
    def: () => "",
    hr: () => "\n",
    html: ({ text }) => stripTags(text),
    code: ({ text }) => `${text}\n\n`,
    heading({ tokens }) {
      return `${this.parser.parseInline(tokens)}\n\n`;
    },
    paragraph({ tokens }) {
      return `${this.parser.parseInline(tokens)}\n\n`;
    },
    blockquote({ tokens }) {
      return this.parser.parse(tokens);
    },
    list({ items, ordered, start }) {
      const first = typeof start === "number" ? start : 1;
      const lines = items.map((item, i) => {
        const bullet = ordered ? `${first + i}. ` : "- ";
        const body = this.parser.parse(item.tokens).trim();
        return bullet + body.replace(/\n/g, "\n  ");
      });
      return `${lines.join("\n")}\n\n`;
    },
    checkbox: ({ checked }) => (checked ? "[x] " : "[ ] "),
    table({ header, rows }) {
      const row = (cells: typeof header) =>
        cells.map((cell) => this.parser.parseInline(cell.tokens)).join(" | ");
      return `${[header, ...rows].map(row).join("\n")}\n\n`;
    },
    strong({ tokens }) {
      return this.parser.parseInline(tokens);
    },
    em({ tokens }) {
      return this.parser.parseInline(tokens);
    },
    del({ tokens }) {
      return this.parser.parseInline(tokens);
    },
    codespan: ({ text }) => text,
    br: () => "\n",
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      return text === href ? href : `${text} (${href})`;
    },
    image: ({ text }) => text,
    text(token) {
      return "tokens" in token && token.tokens
        ? this.parser.parseInline(token.tokens)
        : token.text.replace(/\s*\n\s*/g, " ");
    },
  },
});

/**
 * Build-time loader for content files.
 *
 * - `*.yaml` / `*.yml` are parsed and inlined as a plain JS object.
 * - `*.md` files are split into YAML frontmatter + body; the body is rendered
 *   to HTML with `marked`. The default export is `{ ...frontmatter, html }`.
 * - `*.md?text` renders the body to plain text instead, exporting
 *   `{ ...frontmatter, text }`. It is a separate import so pages that only
 *   need HTML do not ship a second copy of every body.
 *
 * Everything happens during the Vite build, so the worker bundle ships plain
 * data and pre-rendered HTML — no YAML or Markdown parser runs at request time.
 */
export function contentPlugin(): Plugin {
  return {
    name: "nceu-content",
    enforce: "pre",
    load(id) {
      const [file, query] = id.split("?");

      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        const data = parseYaml(readFileSync(file, "utf8"));
        return `export default ${JSON.stringify(data)};`;
      }

      if (file.endsWith(".md")) {
        const raw = readFileSync(file, "utf8");
        const match = raw.match(FRONTMATTER);
        const frontmatter = match ? parseYaml(match[1]) ?? {} : {};
        const body = match ? match[2] : raw;

        if (new URLSearchParams(query).has("text")) {
          const text = (plainText.parse(body, { async: false }) as string)
            .replace(/\n{3,}/g, "\n\n")
            .trim();
          return `export default ${JSON.stringify({ ...frontmatter, text })};`;
        }

        const html = marked.parse(body, { async: false }) as string;
        return `export default ${JSON.stringify({ ...frontmatter, html })};`;
      }

      return null;
    },
  };
}
