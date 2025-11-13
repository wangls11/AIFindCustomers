import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
  },
  build: {
    rollupOptions: {
      external: ["#minpath", "#minproc", "#minurl"],
    },
  },
  // 环境变量配置
  envPrefix: "VITE_",
  // 路径别名配置
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
});
