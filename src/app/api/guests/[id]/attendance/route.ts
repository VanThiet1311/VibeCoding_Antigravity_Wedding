import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Guest, { AttendanceStatus } from "@/models/Guest";
import { requireStaff } from "@/lib/rbac";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireStaff();
        const { status } = await request.json();

        if (!Object.values(AttendanceStatus).includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        await dbConnect();

        const guest = await Guest.findByIdAndUpdate(
            params.id,
            { attendanceStatus: status },
            { new: true }
        );

        if (!guest) {
            return NextResponse.json({ message: "Guest not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, guest });
    } catch (error) {
        console.error("Attendance Update Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
