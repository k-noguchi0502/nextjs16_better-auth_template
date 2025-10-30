import { createAuthClient } from "better-auth/react";
import { twoFactorClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
  plugins: [
    twoFactorClient(),
    adminClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

export const {
  enable: enableTwoFactor,
  disable: disableTwoFactor,
  verifyTotp,
  getTotpUri,
} = authClient.twoFactor;

export const admin = authClient.admin;
