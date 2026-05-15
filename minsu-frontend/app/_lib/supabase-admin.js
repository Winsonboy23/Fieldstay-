import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client using the service_role key. Bypasses RLS.
// MUST NEVER be imported by a Client Component. The "server-only" import above
// makes Next.js throw at build time if a client component imports this.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "public" },
  }
);
