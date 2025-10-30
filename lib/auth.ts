import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { twoFactor, admin } from "better-auth/plugins";

const prisma = new PrismaClient();

export const auth = betterAuth({
  appName: "YourAppName",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    twoFactor({
      issuer: "YourAppName",
    }),
    admin(),
  ],
});

export type Session = typeof auth.$Infer.Session;
