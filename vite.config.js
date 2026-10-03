import { defineConfig } from "vite";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  // GitHub Pages needs the repository path; packaged APK/EXE uses relative assets.
  base: isGitHubPages ? "/institucion-virtual/" : "./",
  build: { target: "es2020" }
});
