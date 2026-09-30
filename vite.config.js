import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" ist nötig, damit die App per file:// aus Electron geladen werden kann.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "dist" },
});
