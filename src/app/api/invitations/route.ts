import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Invitation from "@/models/Invitation";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const invitations = await Invitation.find({ ownerId: session.userId })
            .populate('personId', 'fullName phone')
            .sort({ eventDate: -1 });

        return NextResponse.json(invitations);
    } catch (error) {
        console.error("GET Invitations error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        await dbConnect();

        const invitation = await Invitation.create({
            ...data,
            ownerId: session.userId,
        });

        return NextResponse.json(invitation, { status: 201 });
    } catch (error) {
        console.error("POST Invitation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
