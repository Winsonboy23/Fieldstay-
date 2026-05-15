import Link from "next/link";

function BrandMark({ size = 38, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <circle cx="19" cy="19" r="19" fill="oklch(44% 0.13 183)" opacity={opacity} />
      <path
        d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z"
        fill="white"
        opacity={opacity * 0.95}
      />
      <path
        d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z"
        fill="white"
        opacity={opacity}
      />
    </svg>
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
