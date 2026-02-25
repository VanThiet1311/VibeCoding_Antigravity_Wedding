import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User, { UserRole } from "@/models/User";
import { encrypt } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // First user is always admin (for easier setup), otherwise user
        const count = await User.countDocuments();
        const role = count === 0 ? UserRole.ADMIN : UserRole.USER;

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        // Create session
        const sessionToken = await encrypt({
            userId: user._id.toString(),
            role: user.role,
        });

        const response = NextResponse.json(
            { message: "Registration successful" },
            { status: 201 }
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
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
