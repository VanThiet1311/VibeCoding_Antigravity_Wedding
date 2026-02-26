import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User, { UserRole } from "@/models/User";
import { requireAdmin } from "@/lib/rbac";

// Prevent modifications to the main admin
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAdmin();

        const data = await request.json();
        await dbConnect();

        const targetUser = await User.findById(params.id);

        if (!targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (targetUser.email === ADMIN_EMAIL) {
            return NextResponse.json({ message: "Cannot modify the root admin" }, { status: 403 });
        }

        // Admins cannot change their own role here
        if (params.id === session.userId && data.role && data.role !== UserRole.ADMIN) {
            return NextResponse.json({ message: "Cannot demote yourself" }, { status: 403 });
        }

        // allowed fields: name, role
        const updates: Record<string, unknown> = {};
        if (data.name) updates.name = data.name;
        if (data.role && Object.values(UserRole).includes(data.role)) updates.role = data.role;

        const updatedUser = await User.findByIdAndUpdate(params.id, updates, { new: true });

        return NextResponse.json({ message: "User updated", user: updatedUser });
    } catch {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAdmin();

        await dbConnect();

        const targetUser = await User.findById(params.id);

        if (!targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (targetUser.email === ADMIN_EMAIL) {
            return NextResponse.json({ message: "Cannot delete the root admin" }, { status: 403 });
        }

        if (params.id === session.userId) {
            return NextResponse.json({ message: "Cannot delete yourself here" }, { status: 403 });
        }

        await User.findByIdAndDelete(params.id);
        // Note: In a real system you'd also want to delete all Person/Invitation documents owned by this user

        return NextResponse.json({ message: "User deleted" });
    } catch {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
