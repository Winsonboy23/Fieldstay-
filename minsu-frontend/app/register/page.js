import Link from "next/link";
import { registerAction } from "@/app/_lib/actions";

export const metadata = { title: "註冊 | 山田寓所 FIELDSTAY" };

const errorMessages = {
  missing_fields: "請填寫姓名、Email 與密碼。",
  password_too_short: "密碼至少需要 8 碼。",
  password_mismatch: "兩次輸入的密碼不一致。",
  email_exists: "這個 Email 已經註冊過，請直接登入。",
  register_failed: "註冊失敗，請稍後再試或聯絡管理員。",
};

export default function Page({ searchParams }) {
  const errorMessage = errorMessages[searchParams?.error];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
    .register-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 48px 20px;
      background: oklch(96% 0.010 75);
      color: oklch(18% 0.012 80);
      font-family: 'Noto Sans TC', -apple-system, system-ui, sans-serif;
    }

    .register-card {
      width: min(100%, 440px);
      padding: 40px;
      border: 1px solid oklch(88% 0.008 75);
      border-radius: 22px;
      background: oklch(99% 0.005 75);
      box-shadow: 0 18px 50px rgba(35, 31, 26, 0.08);
    }

    .register-eyebrow {
      margin-bottom: 10px;
      color: oklch(44% 0.13 183);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.22em;
    }

    .register-card h1 {
      margin-bottom: 8px;
      font-family: 'Noto Serif TC', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
    }

    .register-card p {
      margin-bottom: 28px;
      color: oklch(50% 0.010 80);
      line-height: 1.7;
    }

    .register-error {
      margin-bottom: 18px;
      padding: 10px 12px;
      border: 1px solid oklch(72% 0.16 25);
      border-radius: 10px;
      background: oklch(96% 0.03 25);
      color: oklch(45% 0.16 25);
      font-size: 14px;
    }

    .register-field {
      margin-bottom: 16px;
    }

    .register-field label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 700;
    }

    .register-field input {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid oklch(88% 0.008 75);
      border-radius: 10px;
      background: oklch(96% 0.010 75);
      outline: none;
    }

    .register-field input:focus {
      border-color: oklch(44% 0.13 183);
      background: white;
    }

    .register-submit {
      width: 100%;
      margin-top: 8px;
      padding: 13px 18px;
      border: 0;
      border-radius: 10px;
      background: oklch(44% 0.13 183);
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .register-footer {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: oklch(50% 0.010 80);
    }

    .register-footer a {
      color: oklch(44% 0.13 183);
      text-decoration: none;
      font-weight: 700;
    }
  `,
        }}
      />

      <main className="register-page">
        <section className="register-card">
          <div className="register-eyebrow">FIELDSTAY MEMBER</div>
          <h1>建立會員帳號</h1>
          <p>註冊後即可管理訂單、查看入住資訊，並在訂房時帶入會員資料。</p>

          {errorMessage && <div className="register-error">{errorMessage}</div>}

          <form action={registerAction}>
            <div className="register-field">
              <label htmlFor="fullName">姓名</label>
              <input id="fullName" name="fullName" type="text" required />
            </div>

            <div className="register-field">
              <label htmlFor="email">電子郵件</label>
              <input id="email" name="email" type="email" required />
            </div>

            <div className="register-field">
              <label htmlFor="password">密碼</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="passwordConfirm">確認密碼</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                minLength={8}
                required
              />
            </div>

            <button className="register-submit" type="submit">
              註冊並登入
            </button>
          </form>

          <div className="register-footer">
            已經有帳號？ <Link href="/login">回登入頁</Link>
          </div>
        </section>
      </main>
    </>
  );
}
