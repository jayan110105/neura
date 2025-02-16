import NextAuth from "next-auth";
import type {NextAuthConfig} from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env.js";

export const config = {
  providers: [
      GoogleProvider({
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
            },
          },
        }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
        session.access_token = token.accessToken as string;
        return session;
    },
  },
} satisfies NextAuthConfig

export const {handlers, auth, signIn, signOut} = NextAuth(config)