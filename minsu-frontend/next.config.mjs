/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 部署在 Cloudflare Workers，沒有 sharp 可做圖片最佳化，直接輸出原圖網址
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qfvpyreitzgxuimnvjpy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/room-images/**",
      },
      {
        protocol: "https",
        hostname: "wnvqbozqsdvaszfgumkg.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/room-images/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

// 本機 next dev 時讓 getCloudflareContext() 可用（部署後由 OpenNext 提供）
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
