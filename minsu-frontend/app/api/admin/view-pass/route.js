// Internal API：後台員工向前台換取「檢視訂單員工證」
// 驗證：Authorization: Bearer <管理者的 Supabase access_token>
// 通過（該使用者在 admin_users 名單內）才簽發員工證。

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/_lib/supabase-admin";
import { signViewPass } from "@/app/_lib/viewPass";

export const dynamic = "force-dynamic";

const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || "*";
const ALLOWED_TYPES = new Set(["booking", "shop"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": ADMIN_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function json(body, init = {}) {
  const res = NextResponse.json(body, init);
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return json({ error: "unauthorized" }, { status: 401 });

  // 用 service client 驗證這個 Supabase JWT 並取得使用者
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.email) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  // 只有 admin_users 名單內的 email 才算管理者
  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("email")
    .ilike("email", user.email)
    .maybeSingle();
  if (!adminRow) {
    return json({ error: "forbidden" }, { status: 403 });
  }

  const { type, id } = await request.json().catch(() => ({}));
  if (!ALLOWED_TYPES.has(type) || !id) {
    return json({ error: "bad_request" }, { status: 400 });
  }

  const pass = signViewPass(type, String(id));
  return json({ pass });
}
