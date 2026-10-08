"use client";

import { useRef, useState } from "react";
import { suggestEmailFix } from "@/app/_lib/emailTypos";

export default function EmailField() {
  const inputRef = useRef(null);
  const [suggestion, setSuggestion] = useState(null);

  function check(value) {
    const fixed = suggestEmailFix(value);
    setSuggestion(fixed);
    // 已知錯字網域：擋住送出，直到使用者改掉
    inputRef.current?.setCustomValidity(
      fixed ? `這個網域看起來打錯了，是不是要用 ${fixed}？` : ""
    );
  }

  function applyFix() {
    if (!inputRef.current || !suggestion) return;
    inputRef.current.value = suggestion;
    check(suggestion);
    inputRef.current.focus();
  }

  return (
    <div className="register-field">
      <label htmlFor="email">電子郵件</label>
      <input
        ref={inputRef}
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        onChange={(e) => check(e.target.value)}
        onBlur={(e) => check(e.target.value)}
      />
      {suggestion && (
        <p className="register-email-hint" role="alert">
          這個網域好像打錯了，是不是要用{" "}
          <button type="button" onClick={applyFix}>
            {suggestion}
          </button>
          ？
        </p>
      )}
    </div>
  );
}
