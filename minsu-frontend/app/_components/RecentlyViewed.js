"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "fieldstay:recently-viewed";
const MAX_STORED = 24;
const MAX_SHOWN = 6;

function readList() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * 記錄並顯示「近期瀏覽」。資料只存在瀏覽器 localStorage，不進資料庫。
 * type：room / activity / product，同類型才會互相顯示。
 */
export default function RecentlyViewed({ type, item }) {
  const itemJson = JSON.stringify(item);
  const [others, setOthers] = useState([]);

  useEffect(() => {
    const current = JSON.parse(itemJson);
    const id = `${type}:${current.id}`;
    const rest = readList().filter((x) => x && `${x.type}:${x.id}` !== id);

    setOthers(rest.filter((x) => x.type === type).slice(0, MAX_SHOWN));

    try {
      const next = [{ ...current, type }, ...rest].slice(0, MAX_STORED);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // 無痕模式或空間不足就跳過，不影響頁面
    }
  }, [type, itemJson]);

  if (others.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 md:px-10">
      <h2 className="mb-4 border-t border-primary-200 pt-6 text-[11px] uppercase tracking-[0.22em] text-primary-500">
        近期瀏覽
      </h2>
      <ul className="grid list-none grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {others.map((x) => (
          <li key={`${x.type}:${x.id}`}>
            <Link href={x.href} className="group block no-underline">
              <div className="aspect-[4/3] overflow-hidden rounded-lg border border-primary-200 bg-primary-100">
                {x.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={x.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-primary-900">
                {x.name}
              </p>
              {x.price ? (
                <p className="mt-0.5 text-xs text-primary-500">{x.price}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
