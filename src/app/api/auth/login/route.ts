import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { encrypt } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Missing email or password" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Select password because it's normally hidden
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create session
        const sessionToken = await encrypt({
            userId: user._id.toString(),
            role: user.role,
        });

        const response = NextResponse.json(
            {
                message: "Login successful",
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            },
            { status: 200 }
        );

        // HttpOnly cookie
        response.cookies.set({
            name: "session",
            value: sessionToken,
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
