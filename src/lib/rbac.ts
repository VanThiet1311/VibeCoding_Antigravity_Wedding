import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "./auth";
import { UserRole } from "@/models/User";

export async function getSession() {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;
    return await decrypt(token);
}

/**
 * Server-side guard to ensure the user is an admin.
 * Use in Server Actions or Server Components.
 */
export async function requireAdmin() {
    const session = await getSession();
    if (!session || session.role !== UserRole.ADMIN) {
        redirect("/login");
    }
    return session;
}

/**
 * Server-side guard to ensure the user is at least staff.
 * Use in Server Actions or Server Components.
 */
export async function requireStaff() {
    const session = await getSession();
    if (!session || (session.role !== UserRole.STAFF && session.role !== UserRole.ADMIN)) {
        redirect("/login");
    }
    return session;
}

/**
 * Helper to check if the current user has dashboard access (Admin or Staff).
 */
export async function hasDashboardAccess() {
    const session = await getSession();
    if (!session) return false;
    return session.role === UserRole.ADMIN || session.role === UserRole.STAFF;
}
