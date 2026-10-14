import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Eslatma: Rollup modul ID'larini har doim "/" bilan beradi (Windows'da ham),
// shuning uchun yo'lni tekshirishda faqat oldinga qiya chiziq ishlatiladi.
export default defineConfig({
  plugins: [react()],
  // 5173 shu kompyuterda doimiy ishlaydigan admin botga band (pm2).
  // strictPort: port band bo'lsa vite boshqa portga jimgina o'tib ketmaydi,
  // balki aniq xato beradi — loyihalar bir-birining o'rniga ochilib qolmaydi.
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        // Chunk'lar modul YO'LI bo'yicha ajratiladi, paket nomi ro'yxati
        // bo'yicha emas: react-dom o'z kodini ichki cjs faylida saqlaydi va
        // ro'yxat usulida u recharts chunk'iga tushib ketardi.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          )
            return "react";

          // Storage SDK faqat progress suratlari uchun va dinamik import
          // qilinadi. U umumiy "firebase" chunk'iga tushsa, dinamik import
          // ma'nosiz bo'lib, har ochilishda ~55 kB ortiqcha yuklanardi.
          if (
            id.includes("/@firebase/storage/") ||
            id.includes("/firebase/storage/")
          )
            return "firebase-storage";

          if (id.includes("/firebase/") || id.includes("/@firebase/"))
            return "firebase";

          // clsx/tailwind-merge kabi mayda kutubxonalarni ham ATAYLAB
          // nomlaymiz: ular ham entry'da, ham recharts ichida ishlatilgani
          // uchun Rollup ularni "charts" ichiga qo'shib yuborardi va natijada
          // grafiklar chunk'i lazy bo'lsa ham bosh sahifada yuklanardi.
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
