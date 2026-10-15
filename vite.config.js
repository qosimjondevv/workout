import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          )
            return "react";

          if (id.includes("/@firebase/storage/") || id.includes("/firebase/storage/"))
            return "firebase-storage";

          if (id.includes("/firebase/") || id.includes("/@firebase/")) return "firebase";

          if (
            id.includes("/node_modules/clsx/") ||
            id.includes("/node_modules/tailwind-merge/") ||
            id.includes("/node_modules/class-variance-authority/") ||
            id.includes("/node_modules/lucide-react/")
          )
            return "ui";

          if (
            id.includes("/recharts/") ||
            id.includes("/victory-vendor/") ||
            id.includes("/node_modules/d3-")
          )
            return "charts";
        },
      },
    },
  },
});
