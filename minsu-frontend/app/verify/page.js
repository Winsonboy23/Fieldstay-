import Link from "next/link";

export const metadata = { title: "Email 驗證 | 山田寓所 FIELDSTAY" };

export default function Page({ searchParams }) {
  const errorCode = searchParams?.error;
  const errorDesc = searchParams?.error_description;
  const ok = !errorCode;

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
          width: "min(100%, 440px)",
          padding: "40px",
          border: "1px solid oklch(88% 0.008 75)",
          borderRadius: "22px",
          background: "oklch(99% 0.005 75)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "44px",
            marginBottom: "12px",
          }}
        >
          {ok ? "✓" : "✕"}
        </div>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          {ok ? "Email 驗證完成" : "驗證失敗"}
        </h1>
        <p
          style={{
            color: "oklch(50% 0.010 80)",
            lineHeight: 1.7,
            marginBottom: "24px",
          }}
        >
          {ok
            ? "你的帳號已啟用，現在可以使用 email 與密碼登入。"
            : errorDesc
              ? decodeURIComponent(errorDesc)
              : "連結可能已過期或無效，請重新註冊或聯絡客服。"}
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "oklch(44% 0.13 183)",
            color: "white",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          前往登入
        </Link>
      </section>
    </main>
  );
}
