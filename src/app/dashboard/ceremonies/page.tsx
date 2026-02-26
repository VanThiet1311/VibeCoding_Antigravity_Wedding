import React from "react";
import dbConnect from "@/lib/db";
import Ceremony, { ICeremony } from "@/models/Ceremony";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar, MapPin, Clock } from "lucide-react";

async function getCeremonies() {
    try {
        const sessionCookie = cookies().get("session")?.value;
        const session = await decrypt(sessionCookie);

        if (!session) return [];

        await dbConnect();
        const ceremonies = await Ceremony.find({ ownerId: session.userId }).sort({ date: 1 });
        return JSON.parse(JSON.stringify(ceremonies)) as (ICeremony & { _id: string })[];
    } catch (error) {
        console.error("Error fetching ceremonies:", error);
        return [];
    }
}

export default async function CeremoniesPage() {
    const sessionCookie = cookies().get("session")?.value;
    const session = await decrypt(sessionCookie);
    const ceremonies = await getCeremonies();

    return (
        <DashboardLayout userRole={session?.role as string}>
            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-3xl text-gray-800 font-bold">
                        Danh sách nghi lễ
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Quản lý các sự kiện và địa điểm tổ chức.</p>
                </div>

                {ceremonies.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-soft border border-rose-50 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Bạn chưa cấu hình nghi lễ nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ceremonies.map((ceremony) => (
                            <div key={ceremony._id} className="bg-white p-6 rounded-xl shadow-soft border border-rose-50 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-800">{ceremony.name}</h3>
                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full uppercase">
                                        {ceremony.ceremonyType}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-rose-400" />
                                        <span>{new Date(ceremony.date).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-rose-400" />
                                        <span>{ceremony.startTime} - {ceremony.endTime || "..."}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-rose-400" />
                                        <span className="font-medium">{ceremony.locationName}</span>
                                    </div>
                                    <p className="pl-6 text-gray-400 italic">{ceremony.addressDetail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
