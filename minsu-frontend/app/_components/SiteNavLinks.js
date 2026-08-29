import Link from "next/link";

const LINKS = [
  { href: "/", label: "首頁" },
  { href: "/about", label: "關於我們" },
  { href: "/rooms", label: "房型選擇" },
  { href: "/activities", label: "田間體驗" },
  { href: "/shop", label: "選物商店" },
  { href: "/#transport", label: "交通資訊" },
];

// 尺寸比照首頁 .nav-links：膠囊高 42px、內距 8px、連結 8px/18px、14px
export default function SiteNavLinks({ solid }) {
  return (
    <ul
      className={`hidden h-[42px] list-none items-center gap-[0.3rem] rounded-full border p-2 backdrop-blur-md transition-colors md:flex ${
        solid ? "border-black/[0.08] bg-black/[0.04]" : "border-white/[0.22] bg-white/[0.12]"
      }`}
    >
      {LINKS.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className={`inline-flex h-[26px] items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium leading-none tracking-[0.02em] transition hover:bg-accent-500 hover:text-white lg:px-[18px] lg:text-sm ${
              solid ? "text-primary-900" : "text-white"
            }`}
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
