import { requireStaff } from "@/lib/rbac";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SupportDashboardClient from "./SupportDashboardClient";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function SupportAdminPage() {
    await requireStaff();
    const session = await decrypt(cookies().get("session")?.value);

    return (
        <DashboardLayout userRole={session?.role as string}>
            <SupportDashboardClient />
        </DashboardLayout>
    );
}
