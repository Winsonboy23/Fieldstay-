import Image from "next/image";
import Link from "next/link";

export default function Navigation({ handleToggle, session }) {
  return (
    <nav className="z-10 text-sm font-medium">
      <ul className="flex flex-col items-center gap-3 md:flex-row md:gap-8">
        <li>
          <Link
            onClick={handleToggle}
            href="/rooms"
            className="text-primary-700 transition-colors hover:text-accent-700"
          >
            房型
          </Link>
        </li>
        <li>
          <Link
            onClick={handleToggle}
            href="/about"
            className="text-primary-700 transition-colors hover:text-accent-700"
          >
            關於山田
          </Link>
        </li>
        <li>
          {session?.user?.image ? (
            <Link
              onClick={handleToggle}
              href="/account"
              className="flex flex-col-reverse items-center gap-3 rounded-md border border-primary-200 px-4 py-2 text-primary-700 transition-colors hover:border-accent-500 hover:text-accent-700 md:flex-row"
            >
              <div className="size-8 relative">
                <Image
                  fill
                  className="rounded-full object-cover"
                  src={session.user.image}
                  alt={session.user.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span>會員中心</span>
            </Link>
          ) : (
            <Link
              onClick={handleToggle}
              href="/account"
              className="rounded-md bg-accent-600 px-4 py-2 text-white transition-colors hover:bg-accent-700"
            >
              會員中心
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
