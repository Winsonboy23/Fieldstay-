"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "山田寓所適合什麼樣的旅人？",
    a: "適合想放慢節奏、喜歡老屋、田野、咖啡與安靜生活感的人。如果你期待熱鬧商圈或密集行程，這裡可能不是最合適的選擇。",
  },
  {
    q: "住宿之外還能做什麼？",
    a: "可安排咖啡、藝術課程、土地導覽與季節性的田間體驗。實際活動會依天候、季節與地方夥伴安排調整。",
  },
  {
    q: "老屋空間會不會不方便？",
    a: "老屋保留部分原始格局與材質，同時已針對住宿所需做必要修繕與整理。若有行動需求或特殊入住需求，建議訂房前先告知。",
  },
  {
    q: "如何聯絡山田寓所？",
    a: "可透過 Email：fieldstay00@gmail.com 聯絡。地址位於台中市大甲區鐵砧山旁。",
  },
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState(-1);

  return (
    <div className="mx-auto max-w-[820px] border-t border-primary-200">
      {ITEMS.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="border-b border-primary-200">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 py-6 text-start font-serif text-base font-semibold leading-tight tracking-wide text-primary-900"
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <span
                className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border text-sm leading-none transition-all duration-200 ${
                  isOpen
                    ? "rotate-45 border-accent-700 bg-accent-700 text-white"
                    : "border-primary-200 text-primary-900"
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="max-w-[720px] pb-6 text-sm leading-relaxed text-primary-500">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
