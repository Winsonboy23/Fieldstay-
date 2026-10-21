import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// 先不啟用 R2 / KV 增量快取，網站頁面以動態渲染為主；之後需要 ISR 再加 incrementalCache。
export default defineCloudflareConfig({});
