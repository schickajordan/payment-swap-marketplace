import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { appRoutes, authRoutes } from "@/lib/navigation";
import { UserRole } from "@/lib/types/roles";

export async function requireRole(allowedRoles: UserRole[]) {
  const { user, role } = await getCurrentSession();

  if (!user || !role) {
    redirect(authRoutes.signIn);
  }

  if (!allowedRoles.includes(role)) {
    redirect(appRoutes.unauthorized);
  }

  return { user, role };
}
