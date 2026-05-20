import Link from "next/link";
import BrandMark from "./BrandMark";

function Logo({ handleToggle }) {
  return (
    <Link
      onClick={handleToggle}
      href="/"
      className="z-10 flex items-center gap-3"
    >
      <BrandMark />
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
