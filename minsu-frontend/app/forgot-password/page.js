import Link from "next/link";
import { forgotPasswordAction } from "@/app/_lib/actions";

export const metadata = { title: "忘記密碼 | 山田寓所 FIELDSTAY" };

const errorMessages = {
  missing_email: "請輸入 email。",
  failed: "送出失敗，請稍後再試。",
};

export default function Page({ searchParams }) {
  const errorMessage = errorMessages[searchParams?.error];
  const sent = searchParams?.sent === "1";

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
        }}
      >
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
          忘記密碼
        </h1>
        <p
          style={{
            color: "oklch(50% 0.010 80)",
            lineHeight: 1.7,
            marginBottom: "24px",
          }}
        >
          請輸入註冊時使用的 email，我們會寄送密碼重設連結給你。
        </p>

        {sent && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 12px",
              border: "1px solid oklch(72% 0.14 148)",
              borderRadius: "10px",
              background: "oklch(96% 0.03 148)",
              color: "oklch(36% 0.12 148)",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            如果此 email 已註冊，密碼重設信已寄出，請至信箱點擊連結。
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 12px",
              border: "1px solid oklch(72% 0.16 25)",
              borderRadius: "10px",
              background: "oklch(96% 0.03 25)",
              color: "oklch(45% 0.16 25)",
              fontSize: "14px",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form action={forgotPasswordAction}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              電子郵件
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid oklch(88% 0.008 75)",
                borderRadius: "10px",
                background: "oklch(96% 0.010 75)",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              background: "oklch(44% 0.13 183)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            寄送重設連結
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "14px",
            color: "oklch(50% 0.010 80)",
          }}
        >
          <Link
            href="/login"
            style={{
              color: "oklch(44% 0.13 183)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            返回登入
          </Link>
        </div>
      </section>
    </main>
  );
}
