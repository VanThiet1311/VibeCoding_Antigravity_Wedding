import React from "react";

/**
 * AuthLayout
 * Centered card layout specifically for login, registration, and password recovery.
 * Features soft styling, rose borders, and clean typography.
 */
export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-champagne-light p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-rose-50 overflow-hidden">
                <div className="bg-rose-50/50 p-6 text-center border-b border-rose-100">
                    <h1 className="font-serif text-2xl text-rose-600 font-bold mb-1">
                        {title || "WeddingManager"}
                    </h1>
                    <p className="text-sm text-neutral-500">
                        {subtitle || "Access your planner account"}
                    </p>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
