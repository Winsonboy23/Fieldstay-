import Link from "next/link";

export const metadata = { title: "驗證信已寄出 | 山田寓所 FIELDSTAY" };

export default function Page({ searchParams }) {
  const email = typeof searchParams?.email === "string" ? searchParams.email : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 20px",
        background: "oklch(96% 0.010 75)",
        fontFamily: "system-ui, sans-serif",
        color: "oklch(18% 0.012 80)",
      }}
    >
      <section
        style={{
          width: "min(100%, 460px)",
          padding: "40px 32px",
          border: "1px solid oklch(88% 0.008 75)",
          borderRadius: "22px",
          background: "oklch(99% 0.005 75)",
          textAlign: "center",
          boxShadow: "0 18px 50px rgba(35, 31, 26, 0.08)",
        }}
      >
        <div
          style={{
            margin: "0 auto 20px",
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "oklch(92% 0.06 160)",
            color: "oklch(40% 0.12 160)",
          }}
          aria-hidden="true"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 style={{ marginBottom: 12, fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700 }}>
          註冊成功！
        </h1>

        <p style={{ marginBottom: 8, color: "oklch(35% 0.010 80)", lineHeight: 1.7 }}>
          驗證信已寄送到
        </p>
        {email ? (
          <p style={{ marginBottom: 20, fontWeight: 700, fontSize: 16, wordBreak: "break-all" }}>
            {email}
          </p>
        ) : null}

        <p style={{ marginBottom: 28, color: "oklch(50% 0.010 80)", lineHeight: 1.7, fontSize: 14 }}>
          請至信箱點擊驗證連結完成註冊，之後即可登入使用。
          <br />
          若沒收到信，請確認垃圾郵件夾或稍後再試。
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "13px 28px",
            borderRadius: 10,
            background: "oklch(44% 0.13 183)",
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          前往登入頁
        </Link>
      </section>
    </main>
  );
}
