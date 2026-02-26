import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Invitation from "@/models/Invitation";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const invitation = await Invitation.findOneAndDelete({
            _id: params.id,
            ownerId: session.userId,
        });

        if (!invitation) {
            return NextResponse.json({ message: "Invitation not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Invitation deleted successfully" });
    } catch (error) {
        console.error("DELETE Invitation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        await dbConnect();

        const invitation = await Invitation.findOneAndUpdate(
            { _id: params.id, ownerId: session.userId },
            { $set: data },
            { new: true }
        );

        if (!invitation) {
            return NextResponse.json({ message: "Invitation not found" }, { status: 404 });
        }

        return NextResponse.json(invitation);
    } catch (error) {
        console.error("PATCH Invitation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
