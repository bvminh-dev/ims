import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@/shared/constants";

/**
 * Get the user role from Clerk session claims or public metadata
 * Falls back to UserRole.USER if not found
 */
export async function getUserRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  const user = await currentUser();

  console.log("sessionClaims", sessionClaims);
  console.log("user", user);
  const role =
    (sessionClaims?.metadata as { role?: string })?.role ??
    (user?.publicMetadata?.role as string) ??
    UserRole.USER;

  return role as UserRole;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role.toLowerCase() === UserRole.ADMIN.toLowerCase();
}

/**
 * Check if the current user can edit (is admin)
 */
export async function canEdit(): Promise<boolean> {
  return isAdmin();
}
