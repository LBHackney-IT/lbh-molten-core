import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"

const authHandler = (
  req: NextApiRequest,
  res: NextApiResponse
): void | Promise<void> =>
  NextAuth(req, res, {
    providers: [
      Providers.Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],

    pages: {
      signIn: "/sign-in",
    },

    callbacks: {
      // restrict to hackney accounts
      async signIn(user, account, profile) {
        if (
          account.provider === "google" &&
          profile.verified_email === true &&
          profile.email.endsWith(process.env.ALLOWED_DOMAIN)
        ) {
          return true
        } else {
          return false
        }
      },
    },
    adapter: PrismaAdapter(prisma),
    secret: process.env.SESSION_SECRET,
  })

export default authHandler
