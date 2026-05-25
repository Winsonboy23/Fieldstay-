import Link from "next/link";

const BRAND_LOGO_URL =
  "https://wnvqbozqsdvaszfgumkg.supabase.co/storage/v1/object/public/site-images/1778689945313-0.1766648174384008-528684274_18019731992746464_3668865358020989427_n--1-.jpg";

function BrandMark() {
  return (
    <img
      src={BRAND_LOGO_URL}
      alt="山田寓所"
      style={{
        width: 38,
        height: 38,
        objectFit: "contain",
        borderRadius: "50%",
      }}
    />
  );
}

export default function SiteHeader({ user = null }) {
  const userName = user?.name || user?.email || "會員中心";

  return (
    <nav
      className="sticky top-0 z-[200] flex h-16 items-center justify-between px-6 backdrop-blur-md md:px-10"
      style={{
        background: "rgba(253, 251, 249, 0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Link href="/" className="flex items-center gap-3 no-underline">
        <BrandMark />
        <div className="flex flex-col leading-none">
          <span
            className="font-serif text-[15px] font-semibold text-primary-900"
            style={{ letterSpacing: "0.08em" }}
          >
            山田寓所
          </span>
          <span
            className="mt-[2px] text-[9px] uppercase text-primary-500"
            style={{ letterSpacing: "0.22em" }}
          >
            FIELDSTAY
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/faq"
          className="hidden text-sm font-medium text-primary-700 transition hover:text-accent-700 md:inline-flex"
        >
          FAQ
        </Link>
        {user ? (
          <>
            <Link
              href="/account"
              className="inline-flex items-center rounded-lg border border-primary-200 px-[18px] py-2 text-sm font-medium text-primary-900 transition hover:border-primary-900 hover:bg-primary-900 hover:text-primary-50"
            >
              會員中心
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center rounded-lg bg-accent-500 px-[18px] py-2 text-sm font-medium text-white transition hover:bg-accent-700"
            >
              {userName}
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/account"
              className="inline-flex items-center rounded-lg border border-primary-200 px-[18px] py-2 text-sm font-medium text-primary-900 transition hover:border-primary-900 hover:bg-primary-900 hover:text-primary-50"
            >
              會員中心
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-accent-500 px-[18px] py-2 text-sm font-medium text-white transition hover:bg-accent-700"
            >
              登入
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
