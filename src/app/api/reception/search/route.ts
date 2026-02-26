import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Guest from "@/models/Guest";
import Person from "@/models/Person";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { removeAccents } from "@/lib/diacritics";
import type { QueryFilter } from "mongoose";
import { IGuest } from "@/models/Guest";

export async function GET(request: Request) {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie) as { userId: string } | null;

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");
        const weddingId = searchParams.get("weddingId");

        if (!q || q.length < 2) {
            return NextResponse.json([]);
        }

        await dbConnect();

        const normalizedQ = removeAccents(q);

        // Search for people first
        const people = await Person.find({
            ownerId: session.userId,
            $or: [
                { fullNameNormalized: { $regex: normalizedQ, $options: "i" } },
                { phone: { $regex: q, $options: "i" } }
            ]
        }).limit(20);

        if (people.length === 0) {
            return NextResponse.json([]);
        }

        const personIds = people.map(p => p._id);

        // Find associated guests
        const query: QueryFilter<IGuest> = {
            ownerId: session.userId,
            personId: { $in: personIds }
        };
        if (weddingId) query.weddingId = weddingId;

        const guests = await Guest.find(query)
            .populate("personId", "fullName displayName phone familyGroup")
            .populate("ceremonyId", "name")
            .limit(20);

        return NextResponse.json(guests);
    } catch (error) {
        console.error("Search Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
