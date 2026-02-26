import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

export async function GET() {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            userId: session.userId,
            role: session.role,
            name: session.name,
            email: session.email
        });
    } catch {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
