import "@/app/_styles/globals.css";
import { ReservationProvider } from "./_components/ReservationContext";
import { CartProvider } from "./_components/CartContext";
import { getSettings } from "./_lib/data-service";
import MobileMenu from "./_components/MobileMenu";

const BRAND_LOGO_URL =
  "https://wnvqbozqsdvaszfgumkg.supabase.co/storage/v1/object/public/site-images/1778689945313-0.1766648174384008-528684274_18019731992746464_3668865358020989427_n--1-.jpg";

export async function generateMetadata() {
  try {
    const settings = await getSettings();
    const zh = settings?.brand_name_zh || "山田寓所";
    const tagline = settings?.brand_tagline || "FIELDSTAY";
    const brand = zh;
    const description =
      settings?.brand_description ||
      "山田寓所 FIELDSTAY，位於田間與老屋之間的民宿訂房體驗。";
    const ogImage = settings?.logo_url || BRAND_LOGO_URL;
    const icons = ogImage ? { icon: ogImage } : undefined;
    const fullTitle = tagline ? `${brand} | ${tagline}` : brand;
    return {
      title: {
        template: `%s | ${brand}`,
        default: fullTitle,
      },
      description,
      icons,
      openGraph: {
        title: fullTitle,
        description,
        siteName: brand,
        locale: "zh_TW",
        type: "website",
        images: [{ url: ogImage, alt: brand }],
      },
      twitter: {
        card: "summary",
        title: fullTitle,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: { template: "%s | 山田寓所", default: "山田寓所 | FIELDSTAY" },
    };
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <meta name="color-scheme" content="light" />
      <meta name="theme-color" content="#fdfbf8" />
      <meta name="application-name" content="山田寓所 FIELDSTAY" />
      <meta name="apple-mobile-web-app-title" content="山田寓所" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="referrer" content="origin-when-cross-origin" />
      <meta name="robots" content="index, follow" />
      <body className="antialiased bg-primary-50 text-primary-900 min-h-screen flex flex-col relative font-sans">
        <CartProvider>
          <ReservationProvider>{children}</ReservationProvider>
        </CartProvider>
        <MobileMenu />

        <footer className="sr-only">
          山田寓所 FIELDSTAY
        </footer>
      </body>
    </html>
  );
}
