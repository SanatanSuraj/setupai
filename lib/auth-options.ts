import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";

// Use env in production; dev fallback so app runs without .env (set NEXTAUTH_SECRET in prod)
const secret = process.env.NEXTAUTH_SECRET || "setupai-dev-secret-min-32-chars-for-jwt-signing";

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());

export const authOptions: NextAuthOptions = {
  secret,
  trustHost: true, // use request host when NEXTAUTH_URL is not set (e.g. dev)
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        const org = await Organization.findById(user.organizationId).lean();
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId.toString(),
          subscriptionTier: org?.subscriptionTier ?? "free",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (!user) return token;

      // Email/password — authorize() already returns Mongo user + org context
      if (account?.provider === "credentials") {
        const u = user as {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          organizationId?: string;
          subscriptionTier?: string;
        };
        token.sub = u.id;
        token.email = u.email;
        token.name = u.name;
        token.role = u.role;
        token.organizationId = u.organizationId;
        token.subscriptionTier = u.subscriptionTier;
        return token;
      }

      // Google — link to existing user by email or create org + user (same idea as /api/auth/register)
      if (account?.provider === "google" && user.email) {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email.toLowerCase().trim() }).lean();
        if (!dbUser) {
          const oauthPassword = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
          const displayName = user.name?.trim() || user.email.split("@")[0] || "User";
          const orgName = `${displayName}'s Lab`;
          const org = await Organization.create({
            name: orgName,
            labType: "basic",
            city: "Not specified",
            subscriptionTier: "free",
          });
          const created = await User.create({
            name: displayName,
            email: user.email.toLowerCase().trim(),
            password: oauthPassword,
            role: "admin",
            organizationId: org._id,
          });
          dbUser = created.toObject();
        }
        const org = await Organization.findById(dbUser.organizationId).lean();
        token.sub = dbUser._id.toString();
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.role = dbUser.role;
        token.organizationId = dbUser.organizationId.toString();
        token.subscriptionTier = org?.subscriptionTier ?? "free";
        return token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { organizationId?: string }).organizationId = token.organizationId as string;
        (session.user as { subscriptionTier?: string }).subscriptionTier = token.subscriptionTier as string;
      }
      return session;
    },
  },
};
