import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/types";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "setupai-dev-secret-min-32-chars-for-jwt-signing";

export async function getSessionUser(req: NextRequest) {
  const token = await getToken({ req, secret: JWT_SECRET });
  if (!token?.sub || !token?.email) return null;
  return {
    id: token.sub,
    email: token.email as string,
    name: token.name as string,
    role: token.role as UserRole,
    organizationId: token.organizationId as string,
    subscriptionTier: token.subscriptionTier as string,
  };
}

export function hasRole(userRole: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(userRole);
}

export function hasSubscriptionTier(tier: string, required: "free" | "pro" | "enterprise"): boolean {
  const order = { free: 0, pro: 1, enterprise: 2 };
  return order[tier as keyof typeof order] >= order[required];
}
