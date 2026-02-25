import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Person from "@/models/Person";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { UserRole } from "@/models/User";

export async function GET(request: Request) {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Admins can see all if they want, but default to own people
        const { searchParams } = new URL(request.url);
        const viewAll = searchParams.get('all') === 'true';

        const query = (session.role === UserRole.ADMIN && viewAll)
            ? {}
            : { ownerId: session.userId };

        const people = await Person.find(query).sort({ createdAt: -1 });

        return NextResponse.json(people);
    } catch (error) {
        console.error("GET People error:", error);
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

        const person = await Person.create({
            ...data,
            ownerId: session.userId,
        });

        return NextResponse.json(person, { status: 201 });
    } catch (error) {
        console.error("POST Person error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
