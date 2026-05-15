import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createGuest, getGuest } from "./data-service";
import { supabase } from "./supabase";

class EmailNotConfirmed extends CredentialsSignin {
  code = "email_not_confirmed";
}

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}

async function ensureGuestRecord({ email, fullName }) {
  const existing = await getGuest(email);
  if (existing) return existing;
  await createGuest({ email, fullName: fullName || email });
  return getGuest(email);
}

const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        // 1. Try Supabase Auth (new users from Phase 1+)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (data?.user) {
          const fullName =
            data.user.user_metadata?.fullName || data.user.email;
          const guest = await ensureGuestRecord({ email, fullName });
          return {
            id: String(guest.id),
            name: guest.fullName,
            email: guest.email,
          };
        }

        if (error) {
          const msg = String(error.message || "").toLowerCase();
          if (msg.includes("email not confirmed")) {
            throw new EmailNotConfirmed();
          }
        }

        throw new InvalidCredentials();
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },

    async session({ session }) {
      const guest = await getGuest(session.user.email);
      if (guest) session.user.guestId = guest.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
