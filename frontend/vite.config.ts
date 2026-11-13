import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativa: o build estático funciona em qualquer subpasta (GitHub Pages etc.)
export default defineConfig({ base: "./", plugins: [react()] });
