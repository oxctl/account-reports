import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mkcert({
      keyFileName: "./localhost-key.pem",
      certFileName: "./localhost.pem",
    }),
    react(),
  ],
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        nodePolyfills()
      ]
    },
    // This means we don't have to change the config in cloudflare.
    outDir: 'build'
  },
  server: {
    port: 3000,
    https: true,
    proxy: {
      "/api": "https://oxeval.instructure.com",
    },
  },
});
