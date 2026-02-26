import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/reception", "/admin"];
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

    // 1. Unauthenticated users cannot access protected routes
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    // 2. Authenticated users with "user" role are blocked from the dashboard
    if (isProtectedRoute && session?.role === "user") {
        return NextResponse.redirect(new URL("/", request.nextUrl));
    }

    // 3. Admin routes require strict "admin" role
    if (isAdminRoute) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.nextUrl));
        }
        if (session.role !== "admin") {
            return NextResponse.redirect(new URL("/", request.nextUrl));
        }
    }

    // 4. Redirect logged-in users away from auth pages
    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
