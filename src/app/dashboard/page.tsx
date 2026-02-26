import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Guest, { AttendanceStatus } from "@/models/Guest";
import Ceremony from "@/models/Ceremony";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, UserCheck, Table2, Heart, QrCode } from "lucide-react";
import QRCodeView from "@/components/qr/QRCodeView";

// Fetch live stats from DB for the owner
async function getStats(ownerId: string) {
    await dbConnect();

    const [ceremonies, total, confirmed, arrived, seated, left] = await Promise.all([
        Ceremony.countDocuments({ ownerId }),
        Guest.countDocuments({ ownerId }),
        Guest.countDocuments({ ownerId, attendanceStatus: AttendanceStatus.CONFIRMED }),
        Guest.countDocuments({ ownerId, attendanceStatus: AttendanceStatus.ARRIVED }),
        Guest.countDocuments({ ownerId, attendanceStatus: AttendanceStatus.SEATED }),
        Guest.countDocuments({ ownerId, attendanceStatus: AttendanceStatus.LEFT }),
    ]);

    return {
        ceremonies,
        total,
        confirmed,
        arrived,
        seated,
        left,
        present: arrived + seated
    };
}

export default async function DashboardPage() {
    const cookieStore = cookies();
    const session = await decrypt(cookieStore.get("session")?.value);

    if (!session || !session.userId) {
        redirect("/login");
    }

    const ownerId = session.userId as string;
    const stats = await getStats(ownerId);

    // For demo: get first ceremony to show Venue QR
    const mainCeremony = await Ceremony.findOne({ ownerId });
    const checkpointPayload = mainCeremony ? {
        weddingId: mainCeremony.weddingId,
        ceremonyId: mainCeremony._id,
        type: "venue-checkpoint",
        issuedAt: Date.now()
    } : null;

    const qrToken = checkpointPayload
        ? Buffer.from(JSON.stringify(checkpointPayload)).toString("base64url")
        : null;


    const attendanceRate = stats.total > 0
        ? Math.round((stats.present / stats.total) * 100)
        : 0;

    const cards = [
        {
            label: "Tổng khách mời",
            value: stats.total,
            icon: <Users className="w-6 h-6 text-blue-500" />,
            bg: "bg-blue-50",
        },
        {
            label: "Đã xác nhận",
            value: stats.confirmed,
            icon: <Heart className="w-6 h-6 text-pink-500" />,
            bg: "bg-pink-50",
        },
        {
            label: "Đã đến (Có mặt)",
            value: stats.present,
            icon: <UserCheck className="w-6 h-6 text-emerald-500" />,
            bg: "bg-emerald-50",
        },
        {
            label: "Đã vào bàn",
            value: stats.seated,
            icon: <Table2 className="w-6 h-6 text-amber-500" />,
            bg: "bg-amber-50",
        },
        {
            label: "Tỉ lệ tham dự",
            value: `${attendanceRate}%`,
            icon: <QrCode className="w-6 h-6 text-rose-500" />,
            bg: "bg-rose-50",
        },
    ];

    return (
        <DashboardLayout userRole={session.role as string}>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="font-serif text-3xl text-gray-800 font-bold">Tổng quan</h1>
                    <p className="text-gray-500 mt-1 text-sm">Dữ liệu thời gian thực từ hệ thống điểm danh.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className="bg-white rounded-xl p-5 shadow-soft border border-rose-50 flex flex-col gap-3"
                        >
                            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-soft border border-rose-50">
                    <h2 className="font-semibold text-gray-800 mb-4">Thao tác nhanh</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <a
                            href="/dashboard/guests"
                            className="flex items-center gap-3 p-4 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            <div>
                                <p className="font-medium text-sm">Quản lý khách mời</p>
                                <p className="text-rose-200 text-xs">Danh sách & phân bàn</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Venue QR Section */}
                {qrToken && (
                    <div className="bg-white rounded-xl p-8 shadow-soft border border-rose-100 text-center flex flex-col items-center">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800">QR Điểm Danh Tại Chỗ</h2>
                            <p className="text-gray-500 text-sm mt-1">Vui lòng cung cấp mã này cho khách để họ tự quét</p>
                        </div>

                        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-6">
                            <QRCodeView token={qrToken} guestName="Venue Checkpoint" size={200} />
                        </div>

                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-full text-sm font-medium">
                            <QrCode size={18} />
                            <span>{mainCeremony?.name}</span>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
