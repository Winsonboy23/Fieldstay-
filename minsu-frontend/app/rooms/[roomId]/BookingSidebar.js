"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function toIsoDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmtDisplay(date) {
  if (!date) return "—";
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

// 行動版 CTA 用：簡短的日期區間，跨年才顯示年份
function fmtRangeShort(from, to) {
  if (!from || !to) return "";
  const fy = from.getFullYear();
  const ty = to.getFullYear();
  const fm = from.getMonth() + 1;
  const tm = to.getMonth() + 1;
  const fd = from.getDate();
  const td = to.getDate();
  const crossYear = fy !== ty;
  const sameMonth = !crossYear && fm === tm;
  const startStr = crossYear ? `${fy}年${fm}月${fd}日` : `${fm}月${fd}日`;
  const endStr = crossYear
    ? `${ty}年${tm}月${td}日`
    : sameMonth
    ? `${td}日`
    : `${tm}月${td}日`;
  return `${startStr}至${endStr}`;
}

function nightsBetween(from, to) {
  if (!from || !to || to <= from) return 0;
  return Math.round((to - from) / 86400000);
}

function formatNT(value) {
  return `NT$${Number(value || 0).toLocaleString()}`;
}

function parseIsoToLocalDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export default function BookingSidebar({
  roomId,
  pricePerNight = 0,
  cleaningFee = 500,
  serviceFeeRate = 0.05,
  maxCapacity = 4,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [range, setRange] = useState(null);
  const [open, setOpen] = useState(false); // datepicker popover
  const [sheetOpen, setSheetOpen] = useState(false); // mobile bottom sheet
  const [guests, setGuests] = useState(searchParams.get("guests") || "2");
  const [note, setNote] = useState("付款方式：轉帳；訂房前需先登入會員帳號");

  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (range) return;
    const today = startOfToday();
    const fromParam = parseIsoToLocalDate(searchParams.get("checkin"));
    const toParam = parseIsoToLocalDate(searchParams.get("checkout"));
    const from = fromParam && fromParam >= today ? fromParam : today;
    const tomorrow = addDays(from, 1);
    const to = toParam && toParam > from ? toParam : tomorrow;
    setRange({ from, to });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // close popover on outside click / Esc
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (
        popoverRef.current?.contains(e.target) ||
        triggerRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Esc closes bottom sheet, lock body scroll while open
  useEffect(() => {
    if (!sheetOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setSheetOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [sheetOpen]);

  const { nights, roomTotal, serviceFee, total } = useMemo(() => {
    const n = nightsBetween(range?.from, range?.to);
    const r = pricePerNight * n;
    const s = Math.round(r * serviceFeeRate);
    return { nights: n, roomTotal: r, serviceFee: s, total: r + cleaningFee + s };
  }, [range, pricePerNight, cleaningFee, serviceFeeRate]);

  function handleSelectRange(next) {
    if (!next) {
      setRange(null);
      return;
    }
    setRange(next);
    if (next.from && next.to && next.to > next.from) {
      setOpen(false);
    }
  }

  function handleBook() {
    if (!range?.from || !range?.to || nights <= 0) {
      setNote("請選擇正確的入住與退房日期。付款方式：轉帳");
      setSheetOpen(true);
      return;
    }
    const query = new URLSearchParams({
      checkin: toIsoDate(range.from),
      checkout: toIsoDate(range.to),
      guests,
    });
    router.push(`/rooms/${roomId}/confirm?${query.toString()}`);
  }

  const today = startOfToday();

  return (
    <>
      {sheetOpen ? (
        <button
          type="button"
          className="mobile-sheet-backdrop"
          aria-label="關閉預約面板"
          onClick={() => setSheetOpen(false)}
        />
      ) : null}

      <div className={`booking-sidebar${sheetOpen ? " is-sheet-open" : ""}`}>
        <div className="mobile-sheet-handle" aria-hidden="true" />
        <button
          type="button"
          className="mobile-sheet-close"
          onClick={() => setSheetOpen(false)}
          aria-label="關閉"
        >
          ×
        </button>

        <div className="sidebar-price">
          {formatNT(pricePerNight)} <sub>/ 夜</sub>
        </div>

        <div className="date-picker">
          <div className="date-row">
            <button
              ref={triggerRef}
              type="button"
              className="date-field dp-trigger"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
            >
              <span className="dp-label">入住日期</span>
              <span className="dp-value">{fmtDisplay(range?.from)}</span>
            </button>
            <button
              type="button"
              className="date-field dp-trigger"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
            >
              <span className="dp-label">退房日期</span>
              <span className="dp-value">{fmtDisplay(range?.to)}</span>
            </button>
          </div>
          <div className="date-row">
            <div className="date-field" style={{ border: "none" }}>
              <label htmlFor="guests" className="dp-label">
                房客人數
              </label>
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                {Array.from({ length: maxCapacity }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n} 人
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {open ? (
            <div ref={popoverRef} className="dp-popover" role="dialog" aria-label="選擇日期">
              <DayPicker
                mode="range"
                selected={range || undefined}
                onSelect={handleSelectRange}
                disabled={{ before: today }}
                numberOfMonths={1}
                showOutsideDays
                weekStartsOn={0}
              />
              <div className="dp-popover-foot">
                <span>
                  {range?.from && range?.to
                    ? `${nights} 晚`
                    : "請點選入住日，再點退房日"}
                </span>
                <button
                  type="button"
                  className="dp-close"
                  onClick={() => setOpen(false)}
                >
                  完成
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="price-breakdown">
          <div className="price-row">
            <span>
              {formatNT(pricePerNight)} × {nights} 晚
            </span>
            <span>{formatNT(roomTotal)}</span>
          </div>
          <div className="price-row">
            <span>清潔費</span>
            <span>{formatNT(cleaningFee)}</span>
          </div>
          <div className="price-row">
            <span>服務費</span>
            <span>{formatNT(serviceFee)}</span>
          </div>
          <div className="price-row">
            <span>付款方式</span>
            <span>轉帳</span>
          </div>
          <div className="price-row total">
            <span>總金額</span>
            <span>{formatNT(total)}</span>
          </div>
        </div>

        <button type="button" className="sidebar-btn" onClick={handleBook}>
          確認訂房
        </button>
        <p className="sidebar-note">{note}</p>
      </div>

      {/* Mobile-only sticky CTA (sibling of sidebar — never hidden when sheet collapses) */}
      <div className="mobile-cta" role="region" aria-label="預訂列">
        <button
          type="button"
          className="mobile-cta-expand"
          onClick={() => setSheetOpen(true)}
          aria-label="展開預約資訊"
          aria-expanded={sheetOpen}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <div className="mobile-cta-info">
          <div className="mobile-cta-price">{formatNT(total)}</div>
          <div className="mobile-cta-meta">
            {nights > 0 && range?.from && range?.to
              ? `/ ${nights} 晚 · ${fmtRangeShort(range.from, range.to)}`
              : "請先選擇日期"}
          </div>
        </div>
        <button type="button" className="mobile-cta-btn" onClick={handleBook}>
          立即預約
        </button>
      </div>
    </>
  );
}
