import { defineConfig } from "vite";
import vinext from "vinext";
import rsc from "@vitejs/plugin-rsc";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagetools } from "vite-imagetools";
import { contentPlugin } from "./vite-content-plugin";
import { imageDimensionsPlugin } from "./vite-image-dimensions-plugin";

export default defineConfig({
  plugins: [
    contentPlugin(),
    imageDimensionsPlugin(),
    imagetools(),
    vinext({ rsc: false }),
    rsc({
      entries: {
        rsc: "virtual:vinext-rsc-entry",
        ssr: "virtual:vinext-app-ssr-entry",
        client: "virtual:vinext-app-browser-entry",
      },
    }),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
});
