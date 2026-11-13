import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativa: o build estático funciona em qualquer subpasta (GitHub Pages etc.)
export default defineConfig({
  base: "./",
  plugins: [react()],
  // plotly.js (fonte) referencia `global`, que só existe no Node
  define: { global: "globalThis" },
  build: { chunkSizeWarningLimit: 3000 }, // o chunk do Plotly (com o motor de mapa) é grande de propósito
});
