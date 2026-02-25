import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CardTemplate from "@/models/CardTemplate";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { UserRole } from "@/models/User";

export async function GET() {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Fetch user's templates + public ones
        const query = session.role === UserRole.ADMIN
            ? {}
            : { $or: [{ ownerId: session.userId }, { isPublic: true }] };

        const templates = await CardTemplate.find(query).sort({ createdAt: -1 });

        return NextResponse.json(templates);
    } catch (error) {
        console.error("GET Templates error:", error);
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

        const template = await CardTemplate.create({
            ...data,
            ownerId: session.userId,
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error("POST Template error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
