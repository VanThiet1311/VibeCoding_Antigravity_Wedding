"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-surface border-b border-border px-4 py-4 flex justify-between items-center sm:px-6 lg:px-8">
                <h1 className="text-xl font-serif font-bold text-foreground">Wedding Manager</h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center text-sm font-medium text-foreground/70 hover:text-wedding-600 transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </button>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-8">Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-foreground mb-2">Total People</h3>
                        <p className="text-4xl font-bold text-wedding-600">0</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-foreground mb-2">Invitations Sent</h3>
                        <p className="text-4xl font-bold text-wedding-600">0</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-foreground mb-2">Upcoming Events</h3>
                        <p className="text-4xl font-bold text-wedding-600">0</p>
                    </div>
                </div>

                <div className="mt-12 bg-surface border border-border rounded-xl p-8 text-center shadow-sm">
                    <h3 className="text-xl font-serif font-medium text-foreground mb-4">Welcome to your Wedding Manager</h3>
                    <p className="text-foreground/70 mb-6">Start by adding people to your relationship graph or logging a new invitation.</p>
                    <div className="flex justify-center space-x-4">
                        <button className="px-6 py-2 bg-wedding-600 text-white rounded-md hover:bg-wedding-700 transition">Manage People</button>
                        <button className="px-6 py-2 bg-white border border-border text-foreground rounded-md hover:bg-background transition">Log Invitation</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
