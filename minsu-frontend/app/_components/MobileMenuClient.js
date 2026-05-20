"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import BrandMark from "./BrandMark";

function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <path d="M10 21V14h4v7" />
    </svg>
  );
}
function BookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}
function BedIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9V20" />
      <path d="M21 20v-8a3 3 0 0 0-3-3H9" />
      <circle cx="7.5" cy="13" r="2.5" />
      <path d="M3 17h18" />
    </svg>
  );
}
function LeafIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9 4 0 7 1 7 1s-1 9-6 13" />
      <path d="M4 20s2-4 8-7" />
    </svg>
  );
}
function PinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function ChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

const ITEMS = [
  { href: "/", label: "首頁", icon: HomeIcon },
  { href: "/about", label: "關於我們", icon: BookIcon },
  { href: "/rooms", label: "房型選擇", icon: BedIcon },
  { href: "/activities", label: "田間體驗", icon: LeafIcon },
  { href: "/#transport", label: "交通資訊", icon: PinIcon },
  { href: "/account", label: "會員中心", icon: UserIcon },
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileMenuClient({ session, featuredRooms = [] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const orig = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = orig || "";
    return () => {
      document.body.style.overflow = orig || "";
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const userName = session?.user?.name || session?.user?.email || "";

  return (
    <>
      {/* Hamburger trigger (mobile only) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="開啟選單"
        className="fixed right-3 top-3 z-[300] grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60 md:hidden"
      >
        <MenuIcon />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[290] bg-black/60 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[301] flex h-[100dvh] w-[88%] max-w-sm flex-col bg-gradient-to-b from-[#1c1a16]/95 via-[#15130f]/95 to-[#0d0c0a]/95 text-white shadow-2xl backdrop-blur-md transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {/* Brand row + close */}
        <div className="flex shrink-0 items-center justify-between px-6 pt-6">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
          >
            <BrandMark size={32} alt="山田寓所" />
            <span className="font-serif text-[15px] font-semibold tracking-[0.08em] pb-1">
              山田寓所
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="關閉選單"
            className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mx-6 my-5 border-t border-white/10" />

        {/* MENU label */}
        <p className="px-6 pb-3 text-[10px] font-medium tracking-[0.3em] text-white/40">
          MENU
        </p>

        {/* Items */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-0.5">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                      active ? "bg-white/5" : "hover:bg-white/5"
                    }`}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                        style={{ background: "var(--brand-color)" }}
                      />
                    )}
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        active ? "text-white" : "text-white/60"
                      }`}
                    >
                      <Icon />
                    </span>
                    <span
                      className={`flex-1 text-[15px] ${
                        active ? "font-semibold text-white" : "text-white/80"
                      }`}
                    >
                      {item.label}
                    </span>
                    <ChevronRight className="text-white/30" />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Featured rooms */}
          {featuredRooms.length > 0 && (
            <>
              <div className="mx-3 my-5 border-t border-white/10" />
              <p className="mb-3 px-3 text-[12px] text-white/60">精選房型</p>
              <div className="flex gap-4 px-3 pb-2">
                {featuredRooms.slice(0, 3).map((r) => (
                  <Link
                    key={r.id}
                    href={`/rooms/${r.id}`}
                    onClick={() => setOpen(false)}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={r.name}
                      className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/15 transition group-hover:ring-white/40"
                    />
                    <span className="max-w-[64px] truncate text-[11px] text-white/70 group-hover:text-white">
                      {r.name}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Bottom user bar */}
        <div className="shrink-0 border-t border-white/10 bg-black/30 px-6 py-4">
          {session?.user ? (
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-medium">
                  {userName.slice(0, 1) || "U"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{userName}</span>
                  <span className="block text-[11px] text-white/50">會員</span>
                </span>
              </Link>
              <Link
                href="/api/auth/signout"
                aria-label="登出"
                className="grid h-10 w-10 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <LogoutIcon />
              </Link>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-white py-2 text-center text-sm font-semibold text-black"
              >
                登入
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-white/30 py-2 text-center text-sm"
              >
                註冊
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
