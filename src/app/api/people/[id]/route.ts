import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Person from "@/models/Person";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = (await decrypt(sessionCookie)) as { userId: string; role: string } | null;

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const person = await Person.findOneAndDelete({
            _id: params.id,
            ownerId: session.userId,
        });

        if (!person) {
            return NextResponse.json({ message: "Person not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Person deleted successfully" });
    } catch (error) {
        console.error("DELETE Person error:", error);
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
        const session = (await decrypt(sessionCookie)) as { userId: string; role: string } | null;

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        await dbConnect();

        const person = await Person.findOneAndUpdate(
            { _id: params.id, ownerId: session.userId },
            { $set: data },
            { new: true }
        );

        if (!person) {
            return NextResponse.json({ message: "Person not found" }, { status: 404 });
        }

        return NextResponse.json(person);
    } catch (error) {
        console.error("PATCH Person error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
