import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json(
        { message: "Logout successful" },
        { status: 200 }
    );

    // Clear cookie
    response.cookies.set({
        name: "session",
        value: "",
        httpOnly: true,
        path: "/",
        expires: new Date(0),
    });

    return response;
}
