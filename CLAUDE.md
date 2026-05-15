### Project: HotelBytezz (民宿訂房系統)

monorepo 包含兩個獨立的 app，共用同一個 Supabase database：

| 目錄 | 用途 | 技術 |
|---|---|---|
| [minsu-frontend/](minsu-frontend/) | 客戶端訂房網站 | Next.js 14 (App Router), Tailwind, NextAuth (Google), Supabase |
| [minsu-admin/](minsu-admin/) | 員工後台管理 | Vite + React 18, React Router, React Query v4, styled-components, Supabase |

兩個 app 不共用程式碼，請分別處理。

---

### Commands

**minsu-frontend** (Next.js, port 3000)
- `npm run dev` / `npm run build` / `npm start` / `npm run lint`

**minsu-admin** (Vite, port 5173)
- `npm run dev` / `npm run build` / `npm run preview` / `npm run lint`

`npm run lint` 對 admin 是 `--max-warnings 0`，警告會擋住。

---

### Architecture notes

**minsu-frontend**
- App Router；server actions 放在 [app/_lib/actions.js](minsu-frontend/app/_lib/actions.js)
- 資料存取統一走 [app/_lib/data-service.js](minsu-frontend/app/_lib/data-service.js)
- 認證設定在 [app/_lib/auth.js](minsu-frontend/app/_lib/auth.js)（NextAuth v5 beta）
- Supabase client：[app/_lib/supabase.js](minsu-frontend/app/_lib/supabase.js)
- 路由保護在 [middleware.js](minsu-frontend/middleware.js)
- 全域 styling 用 Tailwind；設定見 [tailwind.config.js](minsu-frontend/tailwind.config.js)

**minsu-admin**
- 以 feature 資料夾組織：[src/features/](minsu-admin/src/features/)（authentication / bookings / check-in-out / dashboard / guests / rooms / settings）
- Server state：React Query v4（注意是 v4，不是 v5，API 不同）
- Form：react-hook-form
- 樣式：styled-components（**不要**改成 Tailwind）
- Toast：react-hot-toast
- DB schema 在 [supabase-schema.sql](minsu-admin/supabase-schema.sql)

---

### Conventions

- 修改既有檔案時跟著既有風格（admin = styled-components / class components patterns；frontend = Tailwind utility classes）。
- 環境變數放 `.env.local`（兩邊各自一份），**不要** commit。
- 動到 DB schema 一律先確認，避免破壞另一個 app。
- 改完 UI 請實際在瀏覽器測一次，不能只看 build 通過。

---

### What this project is NOT

- 沒有 test suite（沒有 jest / vitest / playwright），不要假裝有「跑測試」這個步驟。
- 沒有 TypeScript，兩邊都是 JS（admin 有 `@types/react` 但檔案是 `.jsx`）。
