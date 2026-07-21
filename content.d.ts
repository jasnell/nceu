/// <reference types="vite/client" />

// Build-time content modules handled by `vite-content-plugin.ts`.

declare module "*.yaml" {
  const data: any;
  export default data;
}

declare module "*.yml" {
  const data: any;
  export default data;
}

declare module "*.md" {
  /** Frontmatter fields plus the rendered `html` body. */
  const data: Record<string, any> & { html: string };
  export default data;
}
