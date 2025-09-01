import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import nodePolyfills from "rollup-plugin-polyfill-node";
import { configDefaults } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  // This is needed for deploying to GitHub pages where we might
  // not be deployed at the root
  base: "./",

  plugins: [
    mkcert({
      keyFileName: "./localhost-key.pem",
      certFileName: "./localhost.pem",
    }),
    react(),
    process.env.CI !== "true" && mkcert(),
  ],
  // This is to get rid of errors with Instructure UI which depend on process.env
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        nodePolyfills(),
      ],
    },
    // This means we don't have to change the config in cloudflare.
    outDir: "build",
  },
  server: {
    port: 3000,
    https: true,
    proxy: {
      "/api": "https://oxeval.instructure.com",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "deployment/*"],
  },
});
