import "@/app/_styles/globals.css";
import { ReservationProvider } from "./_components/ReservationContext";
import { getSettings } from "./_lib/data-service";
import MobileMenu from "./_components/MobileMenu";

export async function generateMetadata() {
  try {
    const settings = await getSettings();
    const zh = settings?.brand_name_zh || "訂房系統";
    const tagline = settings?.brand_tagline || "";
    const brand = zh;
    const icons = settings?.logo_url ? { icon: settings.logo_url } : undefined;
    return {
      title: {
        template: `%s | ${brand}`,
        default: tagline ? `${brand} | ${tagline}` : brand,
      },
      icons,
    };
  } catch {
    return {
      title: { template: "%s | 訂房系統", default: "訂房系統" },
    };
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <meta name="color-scheme" content="light" />
      <meta name="theme-color" content="#fdfbf8" />
      <meta
        name="description"
        content="山田寓所 FIELDSTAY，位於田間與老屋之間的民宿訂房體驗。"
      />
      <meta name="application-name" content="山田寓所 FIELDSTAY" />
      <meta name="referrer" content="origin-when-cross-origin" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="HotelBytezz" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="author" content="Alamin, CodeWithAlamin" />
      <meta property="og:author" content="Alamin, CodeWithAlamin" />

      <meta
        name="keywords"
        content="HotelBytezz,
          HotelBytezz Booking,
          HotelBytezz Website,
          Nextjs project,
          Thrilling Experiences,
          Adventure,
          Travel,
          Adventure Trips, 
          Jonas Schmedtmann, 
          Alamin, 
          CodeWithAlamin"
      />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://hotelbytezz-alamin.vercel.app" />
      <meta property="og:title" content="HotelBytezz" />
      <meta
        property="og:description"
        content="Explore HotelBytezz by Alamin (CodeWithAlamin). Find unique destinations, thrilling activities, and plan your next hotel getaway."
      />
      <meta
        property="og:image"
        content="https://hotelbytezz-alamin.vercel.app/thumbnail.jpeg"
      />
      <meta
        property="og:image:secure_url"
        content="https://hotelbytezz-alamin.vercel.app/thumbnail.jpeg"
      />
      <meta property="og:site_name" content="HotelBytezz" />
      <meta
        property="og:image:alt"
        content="Thumbnail image of HotelBytezz website"
      />
      <meta property="og:updated_time" content="2024-09-13T10:23:00Z" />

      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="1080" />

      <meta property="og:locale" content="en_US" />
      <meta name="geo.region" content="BD-13" />
      <meta name="geo.placename" content="Dhaka" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="HotelBytezz" />
      <meta
        name="twitter:description"
        content="Explore HotelBytezz by Alamin (CodeWithAlamin). Find unique destinations, thrilling activities, and plan your next hotel getaway."
      />
      <meta
        name="twitter:image"
        content="https://hotelbytezz-alamin.vercel.app/thumbnail.jpeg"
      />
      <meta
        name="twitter:url"
        content="https://hotelbytezz-alamin.vercel.app"
      />
      <meta name="twitter:site" content="@CodeWithAlamin" />
      <meta name="twitter:creator" content="@CodeWithAlamin" />
      <meta
        name="twitter:image:alt"
        content="Thumbnail image of HotelBytezz website"
      />
      <body className="antialiased bg-primary-50 text-primary-900 min-h-screen flex flex-col relative font-sans">
        <ReservationProvider>{children}</ReservationProvider>
        <MobileMenu />

        <footer className="sr-only">
          山田寓所 FIELDSTAY
        </footer>
      </body>
    </html>
  );
}
