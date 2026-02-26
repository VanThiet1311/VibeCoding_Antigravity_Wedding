import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Wedding from "@/models/Wedding";
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

        const weddings = await Wedding.find({ ownerId: session.userId }).sort({ weddingDate: -1 });

        return NextResponse.json(weddings);
    } catch (error) {
        console.error("GET Weddings API error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
