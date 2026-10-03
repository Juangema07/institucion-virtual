import { defineConfig } from "vite";

const base = process.env.VITE_BASE_PATH || "./";

export default defineConfig({
  // Pages uses /institucion-virtual/; APK/EXE use relative assets.
  base,
  build: { target: "es2020" }
});
