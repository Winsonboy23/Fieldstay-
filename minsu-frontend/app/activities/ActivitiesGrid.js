"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function fmtPrice(p) {
  return `NT$${Number(p || 0).toLocaleString("zh-TW")}`;
}

const WEEKDAY = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parts(activity) {
  const d = new Date(activity.activity_date + "T00:00:00");
  return {
    day: d.getDate(),
    monthLabel: `${MONTHS[d.getMonth()]} · ${WEEKDAY[d.getDay()]}`,
    timeLabel: `${(activity.start_time || "").slice(0, 5)} – ${(
      activity.end_time || ""
    ).slice(0, 5)}`,
  };
}

function seatTagClass(a) {
  const remaining = (a.capacity || 0) - (a.registered || 0);
  if (remaining <= 0) return "full";
  if (remaining <= 2) return "few";
  return "ok";
}

function seatTagText(a) {
  const remaining = (a.capacity || 0) - (a.registered || 0);
  if (remaining <= 0) return "已額滿";
  if (remaining <= 2) return `僅餘 ${remaining} 名`;
  return "名額充足";
}

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const PeopleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function ActivitiesGrid({ activities }) {
  const [sortKey, setSortKey] = useState("date");

  const sorted = useMemo(() => {
    const list = [...(activities || [])];
    if (sortKey === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortKey === "price-desc") list.sort((a, b) => b.price - a.price);
    else
      list.sort((a, b) =>
        String(a.activity_date).localeCompare(String(b.activity_date))
      );
    return list;
  }, [activities, sortKey]);

  return (
    <>
      <div className="filter-row" style={{ justifyContent: "flex-end" }}>
        <select
          className="sort-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="date">日期：由近至遠</option>
          <option value="price-asc">價格：低至高</option>
          <option value="price-desc">價格：高至低</option>
        </select>
      </div>

      <div className="activity-grid" id="actGrid">
        {sorted.map((a) => {
          const p = parts(a);
          const tagClass = seatTagClass(a);
          const isFull = tagClass === "full";
          return (
            <article className="act-card" key={a.id}>
              <Link
                href={`/activities/${a.id}`}
                style={{ display: "contents", textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="act-thumb"
                  style={
                    a.image
                      ? {
                          backgroundImage: `url(${a.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {
                          background:
                            "linear-gradient(155deg, oklch(38% 0.10 162) 0%, oklch(54% 0.12 152) 100%)",
                        }
                  }
                >
                  {a.category && <span className="act-tag">{a.category}</span>}
                  <button
                    className="act-fav"
                    aria-label="加入收藏"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.toggle("faved");
                    }}
                  >
                    <HeartIcon />
                  </button>
                </div>
                <div className="act-body">
                  <div className="act-date">
                    <span className="day">{p.day}</span>
                    <span className="month">{p.monthLabel}</span>
                    <span
                      className="time"
                      style={{ color: "var(--muted)" }}
                    >
                      {p.timeLabel}
                    </span>
                  </div>
                  <h3>{a.title}</h3>
                  <p className="act-desc">{a.summary}</p>
                  <div className="act-info">
                    <span>
                      <ClockIcon /> {a.duration || ""}
                    </span>
                    <span>
                      <PeopleIcon /> {a.registered} / {a.capacity} {a.unit || "人"}
                    </span>
                    <span>
                      <PinIcon /> {a.location || ""}
                    </span>
                  </div>
                </div>
                <div className="act-foot">
                  <div>
                    <div className="act-price">
                      {fmtPrice(a.price)} <sub>/ {a.unit || "人"}</sub>
                    </div>
                    <span className={`seat-tag ${tagClass}`}>{seatTagText(a)}</span>
                  </div>
                  <span
                    className={`btn ${isFull ? "btn-ghost" : "btn-primary"} btn-sm`}
                  >
                    {isFull ? "候補" : "報名"}
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
