import Link from "next/link";
import { Heart, Mail, Users, QrCode, ArrowRight } from "lucide-react";
import QRCodeView from "@/components/qr/QRCodeView";

export default async function LandingPage() {
    // Generate DEMO payload for the guest entry ticket
    const demoPayload = {
        weddingId: "demo_wedding_001",
        ceremonyId: "ceremony_morning",
        guestId: "guest_nguyen_van_a",
        invitationId: "inv_0001",
        guestName: "Nguyen Van A",
        side: "Groom",
        seats: 3,
        issuedAt: Date.now()
    };

    // Encode to base64 string for QR
    const qrToken = Buffer.from(JSON.stringify(demoPayload)).toString("base64url");

    return (
        <div className="min-h-screen bg-champagne-light flex flex-col items-center p-6 pb-20">
            {/* Header / Logo */}
            <header className="w-full max-w-4xl flex justify-between items-center py-6 mb-12">
                <div className="flex items-center gap-2 font-serif">
                    <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white text-xl italic shadow-md">W</div>
                    <span className="text-gray-900 font-bold text-lg">Wedding Manager</span>
                </div>
                <Link href="/login" className="text-gray-500 hover:text-rose-600 text-sm font-medium transition-colors">
                    Đăng nhập Staff
                </Link>
            </header>

            <main className="w-full max-w-lg flex flex-col items-center text-center">
                {/* Hero Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                        Chào mừng bạn đến với <br />
                        <span className="text-rose-600 italic">Lễ Cưới Của Chúng Tôi</span>
                    </h1>
                    <p className="text-gray-600">
                        Cảm ơn bạn đã đến chung vui. Vui lòng xuất trình mã QR bên dưới tại quầy đón khách để điểm danh.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link
                            href={`/invitation/${qrToken}`}
                            className="px-10 py-4 bg-rose-600 text-white rounded-full font-bold shadow-xl hover:bg-rose-700 hover:scale-105 transition-all flex items-center gap-2 group"
                        >
                            Bắt đầu ngay
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* QR Ticket Card */}
                <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-rose-100 mb-12">
                    <div className="bg-rose-600 p-4 text-white flex items-center justify-center gap-2">
                        <QrCode size={20} />
                        <span className="font-medium tracking-wide uppercase text-sm">Mã Vào Cổng / Entry Ticket</span>
                    </div>

                    <div className="p-8 flex flex-col items-center">
                        <div className="mb-6 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                            <QRCodeView token={qrToken} guestName={demoPayload.guestName} size={220} />
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-2xl font-serif font-bold text-gray-900">{demoPayload.guestName}</h2>
                            <p className="text-gray-500 font-medium">{demoPayload.side === "Groom" ? "Khách nhà trai" : "Khách nhà gái"}</p>
                            <div className="inline-block mt-4 px-4 py-1 bg-gray-100 rounded-full text-xs text-gray-400 font-mono">
                                {demoPayload.invitationId}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 p-4 bg-gray-50 flex justify-between items-center px-8">
                        <div className="text-left text-xs uppercase tracking-tighter text-gray-400 font-bold">Lễ cưới sáng / Morning Ceremony</div>
                        <div className="text-right text-xs uppercase tracking-tighter text-gray-400 font-bold">{demoPayload.seats} Chỗ / Seats</div>
                    </div>
                </div>

                {/* Info Links */}
                <div className="grid grid-cols-3 gap-4 w-full px-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-rose-50 text-rose-500">
                            <Users size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sơ đồ bàn</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-rose-50 text-rose-500">
                            <Heart size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Album ảnh</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-rose-50 text-rose-500">
                            <Mail size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gửi lời chúc</span>
                    </div>
                </div>
            </main>

            <footer className="mt-20 text-gray-300 text-[10px] font-sans uppercase tracking-[0.2em]">
                © 2026 Wedding Invitation System • Digital Check-in
            </footer>
        </div>
    );
}
