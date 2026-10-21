import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// 環境變數一律用 import.meta.env.VITE_*（Vite 會自動讀 .env / .env.production），
// 不再把整個 process.env 透過 define 打包進前端 bundle。
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 5173,
    host: "0.0.0.0",
  },
});
