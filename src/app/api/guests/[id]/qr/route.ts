import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Guest from "@/models/Guest";
import { generateQRToken } from "@/lib/qr-token";
import { requireStaff } from "@/lib/rbac";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireStaff();
        await dbConnect();

        const guest = await Guest.findById(params.id);
        if (!guest) {
            return NextResponse.json({ message: "Guest not found" }, { status: 404 });
        }

        const token = generateQRToken({
            weddingId: guest.weddingId.toString(),
            ceremonyId: guest.ceremonyId.toString(),
            guestId: guest._id.toString(),
            invitationId: guest.personId.toString(), // Using personId as fallback for invitationId if not explicit
            issuedAt: Date.now()
        });

        return NextResponse.json({ token });
    } catch (error) {
        console.error("QR Generation Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
