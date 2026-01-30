import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
      // Vite will automatically resolve and build the shared package
      "@dwilive/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
});
