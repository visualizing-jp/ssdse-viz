import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = import.meta.dirname;
const pages = ["index", "about", "a/index", "b/index", "c/index", "d/index", "e/index", "f/index"];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages のプロジェクトサイト（/ssdse-viz/）でもカスタムドメインでも動くよう相対にする。
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p.replace("/index", ""), resolve(root, `${p}.html`)])),
    },
  },
});
