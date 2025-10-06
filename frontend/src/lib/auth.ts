// src/lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

type Creds = { email?: string; password?: string } | undefined;

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Creds) {
        if (!credentials) return null;
        const { email, password } = credentials;
        const AUTH_BACKEND = process.env.NEXT_PUBLIC_ADMIN_BASE_URL;

        let authPayload: any = null;
        try {
          const authRes = await fetch(`${AUTH_BACKEND}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const authText = await authRes.text().catch(() => null);
          try {
            authPayload = authText ? JSON.parse(authText) : null;
          } catch {
            authPayload = authText;
          }

          if (!authRes.ok || !authPayload) {
            console.error("[authorize] invalid credentials or empty payload");
            return null;
          }
        } catch (err) {
          console.error("[authorize] backend error:", err);
          return null;
        }

        const sourceUser = authPayload.user ?? authPayload;

        // Build normalized user object
        const user = {
          id: sourceUser?.id ?? null,
          name: sourceUser?.name ?? null,
          email: sourceUser?.email ?? null,
          created_at: sourceUser?.created_at ?? sourceUser?.createdAt ?? null,

          // backend JWT
          token: authPayload?.token ?? null,

          otherInfo: {},
        };

        if (!user.id || !user.email || !user.token) {
          console.error("[authorize] missing id/email/token");
          return null;
        }

        return user as any;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }: any) {
      // Runs at login (when user present) and on every session check
      if (user) {
        token.id = user.id ?? token.id;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.accessToken = user.token ?? token.accessToken ?? null;
        token.created_at = user.created_at ?? token.created_at ?? null;
        token.otherInfo = user.otherInfo ?? token.otherInfo ?? null;
      }
      return token;
    },

    async session({ session, token }: any) {
      session.user = session.user || ({} as any);

      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.token = token.accessToken ?? null;

      (session.user as any).created_at = token.created_at;
      session.user.otherInfo = token.otherInfo ?? null;

      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
