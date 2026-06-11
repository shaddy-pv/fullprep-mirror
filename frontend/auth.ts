/**
 * @file auth.ts
 * @description NextAuth v5 configuration for FullPrep.
 *
 *  Providers:
 *    - Google OAuth
 *    - GitHub OAuth
 *
 *  Flow:
 *    1. User clicks Google / GitHub button.
 *    2. NextAuth handles the OAuth redirect & callback.
 *    3. On first sign-in, we upsert the user into our MongoDB backend.
 *    4. JWT session is created and stored in a secure cookie.
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  // Use JWT strategy (no database adapter needed — we sync to our own backend)
  session: { strategy: "jwt" },

  callbacks: {
    /**
     * Called after a successful OAuth sign-in.
     * Syncs the OAuth user to our MongoDB backend and stores the backend JWT.
     */
    async jwt({ token, user, account }) {
      // `user` and `account` are only available on first sign-in
      if (account && user) {
        try {
          // Upsert the OAuth user into our backend
          const res = await fetch(`${BACKEND_URL}/auth/oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: account.provider,          // "google" | "github"
              providerId: account.providerAccountId,
              email: user.email,
              name: user.name,
              avatar: user.image,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // Store our own backend JWT inside the NextAuth JWT token
            token.backendToken = data.token;
            token.backendUser = data.user;
          }
        } catch (err) {
          console.error("[NextAuth] Failed to sync OAuth user with backend:", err);
        }
      }
      return token;
    },

    /**
     * Exposes backend token and user to the client via useSession().
     */
    async session({ session, token }) {
      if (token.backendToken) {
        (session as any).backendToken = token.backendToken;
        (session as any).backendUser = token.backendUser;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",   // Redirect to our custom login page
    error: "/login",    // Redirect errors back to login with ?error= param
  },
});
