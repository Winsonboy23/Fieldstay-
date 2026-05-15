"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_KEY || ""
);

const pageStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "48px 20px",
  background: "oklch(96% 0.010 75)",
  fontFamily: "system-ui, sans-serif",
  color: "oklch(18% 0.012 80)",
};

const cardStyle = {
  width: "min(100%, 440px)",
  padding: "40px",
  border: "1px solid oklch(88% 0.008 75)",
  borderRadius: "22px",
  background: "oklch(99% 0.005 75)",
};

const fieldStyle = { marginBottom: "16px" };
const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 700,
};
const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid oklch(88% 0.008 75)",
  borderRadius: "10px",
  background: "oklch(96% 0.010 75)",
  outline: "none",
};
const submitStyle = {
  width: "100%",
  padding: "13px",
  background: "oklch(44% 0.13 183)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
};
const errorBoxStyle = {
  marginBottom: "16px",
  padding: "10px 12px",
  border: "1px solid oklch(72% 0.16 25)",
  borderRadius: "10px",
  background: "oklch(96% 0.03 25)",
  color: "oklch(45% 0.16 25)",
  fontSize: "14px",
};

export default function ResetPasswordClient() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase puts access_token / refresh_token in the URL hash on redirect.
    // setSession() reads them and sets the recovery-mode session.
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) setError("連結已失效，請重新申請忘記密碼。");
          else setReady(true);
        });
    } else {
      // Maybe user landed here without a recovery token — check existing session
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
        else setError("無效或過期的重設連結，請重新申請忘記密碼。");
      });
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (pw.length < 8) {
      setError("密碼至少 8 個字元。");
      return;
    }
    if (pw !== pw2) {
      setError("兩次密碼不一致。");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: pw,
    });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message || "密碼更新失敗，請稍後再試。");
      return;
    }

    // Sign out the recovery session and send user to login.
    await supabase.auth.signOut();
    router.replace("/login?reset=1");
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div
          style={{
            color: "oklch(44% 0.13 183)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.22em",
            marginBottom: "10px",
          }}
        >
          FIELDSTAY ACCOUNT
        </div>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "30px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          重設密碼
        </h1>
        <p
          style={{
            color: "oklch(50% 0.010 80)",
            lineHeight: 1.7,
            marginBottom: "24px",
          }}
        >
          請輸入新密碼，至少 8 個字元。
        </p>

        {error && <div style={errorBoxStyle}>{error}</div>}

        {!ready ? (
          <p style={{ color: "oklch(50% 0.010 80)" }}>驗證連結中…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label htmlFor="pw" style={labelStyle}>
                新密碼
              </label>
              <input
                id="pw"
                type="password"
                minLength={8}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={fieldStyle}>
              <label htmlFor="pw2" style={labelStyle}>
                確認新密碼
              </label>
              <input
                id="pw2"
                type="password"
                minLength={8}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{ ...submitStyle, opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "更新中…" : "更新密碼"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
