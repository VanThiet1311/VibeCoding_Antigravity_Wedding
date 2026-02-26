import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ceremony from "@/models/Ceremony";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const weddingId = searchParams.get("weddingId");

        const query: Record<string, unknown> = { ownerId: session.userId };
        if (weddingId) query.weddingId = weddingId;

        const ceremonies = await Ceremony.find(query).sort({ date: 1 });

        return NextResponse.json(ceremonies);
    } catch (error) {
        console.error("GET Ceremonies error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
