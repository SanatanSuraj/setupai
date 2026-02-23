import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";

// Use env in production; dev fallback so app runs without .env (set NEXTAUTH_SECRET in prod)
const secret = process.env.NEXTAUTH_SECRET || "setupai-dev-secret-min-32-chars-for-jwt-signing";

export const authOptions: NextAuthOptions = {
  secret,
  trustHost: true, // use request host when NEXTAUTH_URL is not set (e.g. dev)
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; email?: string; name?: string; role?: string; organizationId?: string; subscriptionTier?: string };
        token.sub = u.id;
        token.email = u.email;
        token.name = u.name;
        token.role = u.role;
        token.organizationId = u.organizationId;
        token.subscriptionTier = u.subscriptionTier;
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
