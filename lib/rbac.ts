import type { UserRole } from "@/types";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  compliance_manager: 3,
  lab_manager: 2,
  viewer: 1,
};

export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const MODULE_ROLES: Record<string, UserRole> = {
  roadmap: "viewer",
  licensing: "compliance_manager",
  equipment: "lab_manager",
  staff: "lab_manager",
  operations: "lab_manager",
};

export function canAccessModule(userRole: UserRole, module: string): boolean {
  const required = MODULE_ROLES[module] ?? "viewer";
  return canAccess(userRole, required);
}
