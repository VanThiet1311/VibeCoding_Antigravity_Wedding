import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SupportMessage from "@/models/SupportMessage";
import Guest from "@/models/Guest";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * GET /api/support?guestId=...
 * Fetch messages for a specific guest session.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const guestId = searchParams.get("guestId");

        if (!guestId) {
            return NextResponse.json({ message: "Missing guestId" }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch messages for this guest
        const messages = await SupportMessage.find({ guestId })
            .sort({ createdAt: 1 })
            .limit(100);

        return NextResponse.json(messages);
    } catch (error) {
        console.error("GET Support Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST /api/support
 * Send a message (from guest or staff).
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guestId, content, sender } = body;

        if (!guestId || !content || !sender) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // 1. Identify context (weddingId, ownerId) from Guest
        const guest = await Guest.findById(guestId);
        if (!guest) {
            return NextResponse.json({ message: "Guest not found" }, { status: 404 });
        }

        // 2. Security Check for Staff
        if (sender === "staff") {
            const session = await decrypt(cookies().get("session")?.value);
            if (!session || (session.role !== "admin" && session.role !== "staff")) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 1 });
            }
        }

        // 3. Create message
        const message = await SupportMessage.create({
            guestId,
            weddingId: guest.weddingId,
            ownerId: guest.ownerId,
            sender,
            content,
            isRead: false
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error("POST Support Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
