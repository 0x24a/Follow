import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { sentryVitePlugin } from "@sentry/vite-plugin"
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import mkcert from "vite-plugin-mkcert"

import { getGitHash } from "./scripts/lib"

const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const __dirname = fileURLToPath(new URL(".", import.meta.url))
const isCI = process.env.CI === "true" || process.env.CI === "1"
const ROOT = "./src/renderer"

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "out/web"),
    target: "ES2022",
    sourcemap: isCI,

    rollupOptions: {
      input: {
        login: resolve(ROOT, "src/external/login/index.html"),
        main: resolve(ROOT, "index.html"),
      },
    },
  },
  root: ROOT,
  envDir: resolve(__dirname, "."),
  resolve: {
    alias: {
      "@renderer": resolve("src/renderer/src"),
      "@shared": resolve("src/shared/src"),
      "@pkg": resolve("./package.json"),
      "@env": resolve("./src/env.ts"),
    },
  },
  base: "/",
  server: {
    port: 2233,
  },
  plugins: [
    react(),
    mkcert(),
    sentryVitePlugin({
      org: "follow-rg",
      project: "follow",
      disable: !isCI,
      bundleSizeOptimizations: {
        excludeDebugStatements: true,
        // Only relevant if you added `browserTracingIntegration`
        excludePerformanceMonitoring: true,
        // Only relevant if you added `replayIntegration`
        excludeReplayIframe: true,
        excludeReplayShadowDom: true,
        excludeReplayWorker: true,
      },
      moduleMetadata: {
        appVersion:
          process.env.NODE_ENV === "development" ? "dev" : pkg.version,
        electron: false,
      },
      sourcemaps: {
        filesToDeleteAfterUpload: ["out/web/assets/*.js.map"],
      },
    }),

    process.env.ANALYZER && visualizer({ open: true }),
  ],
  define: {
    APP_VERSION: JSON.stringify(pkg.version),
    APP_NAME: JSON.stringify(pkg.name),
    APP_DEV_CWD: JSON.stringify(process.cwd()),

    GIT_COMMIT_SHA: JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA || getGitHash(),
    ),

    DEBUG: process.env.DEBUG === "true",
    ELECTRON: "false",
  },
})
