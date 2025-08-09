import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import Resend from "next-auth/providers/resend"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "noreply@anogo.com",
    }),
  ],
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
})

// Local types for authentication
export type AuthSession = {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
  }
  expires: string
}

export type AuthUser = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  createdAt: Date
  updatedAt: Date
}

// Injectable authentication strategies
export interface AuthStrategy {
  signIn: (email: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  getSession: () => Promise<AuthSession | null>
}

export const createAuthStrategy = (): AuthStrategy => ({
  signIn: async (email: string) => {
    try {
      await signIn("resend", { email, redirect: false })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Authentication failed" 
      }
    }
  },
  signOut: async () => {
    await signOut({ redirect: false })
  },
  getSession: async () => {
    return await auth() as AuthSession | null
  },
})














