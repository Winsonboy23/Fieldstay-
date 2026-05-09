"use client";

import {
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    name: "我的訂單",
    href: "/account/reservations",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "體驗預約",
    href: "/account/experiences",
    icon: CalendarDaysIcon,
  },
  {
    name: "個人資料",
    href: "/account/profile",
    icon: UserIcon,
  },
  {
    name: "返回首頁",
    href: "/",
    icon: HomeIcon,
  },
];

function SideNavigation() {
  const pathname = usePathname();

  return (
    <nav className="overflow-hidden rounded-xl border border-primary-200 bg-primary-50">
      <ul className="flex h-full flex-col text-sm">
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link
              className={`${
                pathname === link.href
                  ? "border-l-4 border-accent-600 bg-accent-50 font-bold text-accent-700"
                  : "border-l-4 border-transparent text-primary-600"
              } flex items-center gap-3 border-b border-primary-200 px-5 py-4 transition-colors last:border-b-0 hover:bg-accent-50 hover:text-accent-700`}
              href={link.href}
            >
              <link.icon className="h-4 w-4" />
              <span>{link.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SideNavigation;
