import React from "react";
import dbConnect from "@/lib/db";
import Wedding, { IWedding } from "@/models/Wedding";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WeddingList from "./WeddingList";

async function getWeddings() {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) return [];

        await dbConnect();
        const weddings = await Wedding.find({ ownerId: session.userId }).sort({ weddingDate: -1 });
        // Direct MongoDB documents can't be passed to client components, so we serialize
        return JSON.parse(JSON.stringify(weddings)) as IWedding[];
    } catch (error) {
        console.error("Error fetching weddings:", error);
        return [];
    }
}

export default async function WeddingsPage() {
    const sessionCookie = cookies().get("session")?.value;
    const session = await decrypt(sessionCookie);
    const weddings = await getWeddings();

    return (
        <DashboardLayout userRole={session?.role as string}>
            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-3xl text-gray-800 font-bold">
                        Đám cưới của tôi
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Quản lý và theo dõi các sự kiện đám cưới của bạn.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-soft border border-rose-50">
                    <WeddingList weddings={weddings} />
                </div>
            </div>
        </DashboardLayout>
    );
}
