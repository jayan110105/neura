import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google"
import { env } from "~/env.js";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import { eq, and } from "drizzle-orm"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    error?: "RefreshTokenError" | "MissingRefreshToken";
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
        authorization: {
          params: {
            access_type: "offline", // Ensures refresh token is requested
            prompt: "consent", 
            scope: "openid profile email https://www.googleapis.com/auth/gmail.readonly",
          },
        },
      }),
],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async session({ session, user }) {
      const [googleAccount] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.userId, user.id), eq(accounts.provider, "google")))

      if (!googleAccount?.refresh_token) {
        console.error("❌ No refresh_token found for user:", user.id)
        session.error = "MissingRefreshToken"
        return session // Exit early if there's no refresh token
      }        
      
      if (googleAccount?.expires_at && googleAccount.expires_at * 1000 < Date.now()) {
        // If the access token has expired, try to refresh it
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: env.AUTH_GOOGLE_ID,
              client_secret: env.AUTH_GOOGLE_SECRET,
              grant_type: "refresh_token",
              refresh_token: googleAccount.refresh_token,
            }),
          })

          const jsonResponse: unknown = await response.json()
          if (!response.ok) throw jsonResponse

          const newTokens = jsonResponse as {
            access_token: string
            expires_in: number
            refresh_token?: string
          }

          await db
            .update(accounts)
            .set({
              access_token: newTokens.access_token,
              expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
              refresh_token:
                newTokens.refresh_token ?? googleAccount.refresh_token,
            })
            .where(eq(accounts.providerAccountId, googleAccount.providerAccountId))

        } catch (error) {
          console.error("Error refreshing access_token", error)
          session.error = "RefreshTokenError"
        }
      }
      return session
    },
  },
} satisfies NextAuthConfig;
