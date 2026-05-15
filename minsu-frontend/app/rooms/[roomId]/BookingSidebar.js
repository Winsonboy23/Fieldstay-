"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function nightsBetween(checkin, checkout) {
  const ci = new Date(checkin);
  const co = new Date(checkout);
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime()) || co <= ci) {
    return 0;
  }
  return Math.round((co - ci) / 86400000);
}

function formatNT(value) {
  return `NT$${Number(value || 0).toLocaleString()}`;
}

export default function BookingSidebar({
  roomId,
  pricePerNight = 0,
  cleaningFee = 500,
  serviceFeeRate = 0.05,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkin, setCheckin] = useState(
    searchParams.get("checkin") || "2026-05-10"
  );
  const [checkout, setCheckout] = useState(
    searchParams.get("checkout") || "2026-05-12"
  );
  const [guests, setGuests] = useState(searchParams.get("guests") || "2");
  const [note, setNote] = useState("付款方式：轉帳；訂房前需先登入會員帳號");

  const { nights, roomTotal, serviceFee, total } = useMemo(() => {
    const n = nightsBetween(checkin, checkout);
    const r = pricePerNight * n;
    const s = Math.round(r * serviceFeeRate);
    return { nights: n, roomTotal: r, serviceFee: s, total: r + cleaningFee + s };
  }, [checkin, checkout, pricePerNight, cleaningFee, serviceFeeRate]);

  function handleBook() {
    if (!checkin || !checkout || nights <= 0) {
      setNote("請選擇正確的入住與退房日期。付款方式：轉帳");
      return;
    }
    const query = new URLSearchParams({ checkin, checkout, guests });
    router.push(`/rooms/${roomId}/confirm?${query.toString()}`);
  }

  return (
    <div className="booking-sidebar">
      <div className="sidebar-price">
        {formatNT(pricePerNight)} <sub>/ 夜</sub>
      </div>

      <div className="date-picker">
        <div className="date-row">
          <div className="date-field">
            <label htmlFor="checkin">入住日期</label>
            <input
              type="date"
              id="checkin"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
            />
          </div>
          <div className="date-field">
            <label htmlFor="checkout">退房日期</label>
            <input
              type="date"
              id="checkout"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
            />
          </div>
        </div>
        <div className="date-row">
          <div className="date-field" style={{ border: "none" }}>
            <label htmlFor="guests">房客人數</label>
            <select
              id="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            >
              <option value="1">1 位大人</option>
              <option value="2">2 位大人</option>
              <option value="3">2 大人 1 兒童</option>
            </select>
          </div>
        </div>
      </div>

      <div className="avail-check">
        <span style={{ fontSize: 13, color: "var(--muted)" }}>空房狀況</span>
        <div className="avail-indicator" style={{ color: "var(--success)" }}>
          <div className="avail-dot"></div>
          有空房
        </div>
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
  );
}
