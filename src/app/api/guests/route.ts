import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Guest from "@/models/Guest";
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
        const ceremonyId = searchParams.get("ceremonyId");
        const populate = searchParams.get("populate") === "true";

        const query: Record<string, unknown> = { ownerId: session.userId };
        if (ceremonyId) query.ceremonyId = ceremonyId;

        let dbQuery = Guest.find(query).sort({ createdAt: -1 });
        if (populate) {
            dbQuery = dbQuery.populate("personId", "fullName displayName phone");
        }

        const guests = await dbQuery.exec();

        return NextResponse.json(guests);
    } catch (error) {
        console.error("GET Guests error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
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

        const guest = await Guest.create({
            ...data,
            ownerId: session.userId,
        });

        return NextResponse.json(guest, { status: 201 });
    } catch (error) {
        console.error("POST Guest error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
