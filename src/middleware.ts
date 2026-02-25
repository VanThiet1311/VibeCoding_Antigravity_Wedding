import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/people", "/invitations", "/designer"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.includes(pathname);

    // Exclude static files and api routes from checking
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/') {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    if (isAdminRoute) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.nextUrl));
        }
        // "admin" is hardcoded here to avoid importing mongoose models in middleware
        if (session.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.nextUrl)); // Unauthorized
        }
    }

    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
