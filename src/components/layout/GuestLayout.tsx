"use client";

import React from "react";

/**
 * GuestLayout
 * Simple, mobile-focused layout for wedding guests.
 * Focused on content, no sidebar, clean aesthetic.
 */
export default function GuestLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-champagne-light flex flex-col font-sans antialiased text-foreground">
            <header className="p-6 flex items-center justify-center border-b border-rose-50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-serif italic text-lg shadow-sm">
                        W
                    </div>
                    <span className="font-serif font-bold text-gray-900 tracking-wide">Lễ Cưới Của Chúng Tôi</span>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 lg:p-12">
                <div className="max-w-2xl mx-auto">
                    {children}
                </div>
            </main>

            <footer className="py-8 text-center text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                Cảm ơn bạn đã tham dự lễ cưới của chúng tôi
            </footer>
        </div>
    );
}
