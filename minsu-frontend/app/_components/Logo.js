import Link from "next/link";

function Logo({ handleToggle }) {
  return (
    <Link
      onClick={handleToggle}
      href="/"
      className="z-10 flex items-center gap-3"
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-600 text-primary-50 shadow-sm">
        <svg width="30" height="30" viewBox="0 0 38 38" fill="none" aria-hidden="true">
          <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="currentColor" opacity="0.95" />
          <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="currentColor" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[15px] font-semibold tracking-[0.08em] text-primary-900">
          山田寓所
        </span>
        <span className="mt-1 text-[9px] tracking-[0.22em] text-primary-500">
          FIELDSTAY
        </span>
      </span>
    </Link>
  );
}

export default Logo;
