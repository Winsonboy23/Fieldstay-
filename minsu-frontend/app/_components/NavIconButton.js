import Link from "next/link";

// 導覽列右側的圓形按鈕，比照首頁的 .user-icon（透明版／實心版兩套配色）
export function navIconClass(solid) {
  const base =
    "relative inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition";
  return solid
    ? `${base} border-black/[0.08] bg-black/[0.04] text-primary-900 hover:bg-primary-900 hover:text-primary-50`
    : `${base} border-white/[0.22] bg-white/[0.12] text-white hover:bg-[rgba(30,30,30,0.78)]`;
}

export default function NavIconButton({ href, label, solid, children }) {
  return (
    <Link href={href} aria-label={label} className={navIconClass(solid)}>
      {children}
    </Link>
  );
}
