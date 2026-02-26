"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, Loader2, Camera, Map, Image, Heart, MessageSquare } from "lucide-react";
import QRScanner from "@/components/qr/Scanner";
import SupportChat from "@/components/chat/SupportChat";

interface GuestPortalClientProps {
    guestId: string;
    guestName?: string;
    invitationId?: string;
}

export default function GuestPortalClient({ guestId, guestName, invitationId }: GuestPortalClientProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanResult, setScanResult] = useState<{ status: string; message: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"home" | "album" | "wishes" | "map">("home");

    const handleScan = useCallback(async (checkpointToken: string) => {
        if (isProcessing || !guestId) return;
        setIsProcessing(true);

        try {
            let ceremonyId = "";
            try {
                const payload = JSON.parse(checkpointToken);
                ceremonyId = payload.ceremonyId;
            } catch {
                ceremonyId = checkpointToken;
            }

            const res = await fetch("/api/reception/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId,
                    ceremonyId,
                    deviceId: "guest-self-scan",
                    scanTime: new Date().toISOString()
                }),
            });

            const data = await res.json();

            if (data.status === "FIRST_CHECKIN" || data.status === "ADDITIONAL_CHECKIN") {
                setScanResult({ status: "success", message: "Check-in thành công! Chào mừng bạn." });
            } else if (data.status === "ALREADY_CHECKED_IN") {
                setScanResult({ status: "info", message: "Bạn đã điểm danh trước đó rồi." });
            } else if (data.status === "FULL") {
                setScanResult({ status: "error", message: "Đã đủ số người được mời." });
            } else if (data.status === "wrong_ceremony") {
                setScanResult({ status: "error", message: "Bạn không thuộc danh sách khách mời của nghi lễ này." });
            } else {
                setScanResult({ status: "error", message: data.message || "Không thể điểm danh. Vui lòng thử lại." });
            }
        } catch (error) {
            console.error("Check-in error:", error);
            setScanResult({ status: "error", message: "Lỗi kết nối. Vui lòng kiểm tra mạng." });
        } finally {
            setIsProcessing(false);
        }
    }, [guestId, isProcessing]);

    if (!guestId) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-soft">
                <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Không tìm thấy thông tin khách</h2>
                <p className="text-gray-500 mt-2">Vui lòng truy cập từ link thiệp mời chính thức.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-md mx-auto pb-24">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{guestName}</h2>
                <p className="text-gray-400 text-xs tracking-widest uppercase">Mã mời: {invitationId}</p>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[300px]">
                {activeTab === "home" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {scanResult ? (
                            <div className={`p-8 rounded-3xl text-center space-y-4 shadow-sm border ${
                                scanResult.status === "success" ? "bg-emerald-50 border-emerald-100" :
                                scanResult.status === "info" ? "bg-blue-50 border-blue-100" :
                                "bg-rose-50 border-rose-100"
                            }`}>
                                {scanResult.status === "success" && <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />}
                                {scanResult.status === "info" && <CheckCircle className="w-16 h-16 text-blue-500 mx-auto" />}
                                {scanResult.status === "error" && <XCircle className="w-16 h-16 text-rose-500 mx-auto" />}

                                <h3 className={`text-xl font-bold ${
                                    scanResult.status === "success" ? "text-emerald-800" :
                                    scanResult.status === "info" ? "text-blue-800" :
                                    "text-rose-800"
                                }`}>
                                    {scanResult.status === "success" ? "Thành công!" :
                                        scanResult.status === "info" ? "Thông báo" : "Thất bại"}
                                </h3>
                                <p className="text-gray-600 text-sm">{scanResult.message}</p>

                                <button
                                    onClick={() => setScanResult(null)}
                                    className="mt-4 px-8 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                                >
                                    Quét lại
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-rose-600 p-4 rounded-2xl text-white text-center flex items-center justify-center gap-2 shadow-lg">
                                    <Camera size={20} />
                                    <span className="font-bold uppercase tracking-wider text-sm">Điểm danh tại cổng</span>
                                </div>
                                <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                                    <QRScanner onScan={handleScan} isProcessing={isProcessing} />
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                                            <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                                            <span className="text-white text-sm font-bold uppercase tracking-widest">Đang xử lý...</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-center text-[10px] text-gray-400 px-8 leading-relaxed uppercase tracking-widest">
                                    Vui lòng hướng camera về phía mã QR được đặt tại quầy lễ tân để hoàn tất điểm danh.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "album" && (
                    <div className="bg-white p-12 rounded-3xl border border-rose-50 shadow-soft text-center space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <Image className="w-16 h-16 text-rose-200 mx-auto" />
                        <h3 className="text-lg font-bold text-gray-800">Album Ảnh Cưới</h3>
                        <p className="text-gray-400 text-sm">Khoảnh khắc hạnh phúc của Linh & Tuấn sẽ sớm được cập nhật tại đây.</p>
                    </div>
                )}

                {activeTab === "wishes" && (
                    <div className="bg-white p-12 rounded-3xl border border-rose-50 shadow-soft text-center space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <Heart className="w-16 h-16 text-rose-200 mx-auto" />
                        <h3 className="text-lg font-bold text-gray-800">Gửi Lời Chúc</h3>
                        <p className="text-gray-400 text-sm">Hãy gửi những lời chúc tốt đẹp nhất đến cô dâu và chú rể nhé!</p>
                        <button className="px-6 py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold shadow-md hover:bg-rose-700 transition-colors">
                            Viết lời chúc
                        </button>
                    </div>
                )}

                {activeTab === "map" && (
                    <div className="bg-white p-12 rounded-3xl border border-rose-50 shadow-soft text-center space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <Map className="w-16 h-16 text-rose-200 mx-auto" />
                        <h3 className="text-lg font-bold text-gray-800">Sơ Đồ Chỗ Ngồi</h3>
                        <p className="text-gray-400 text-sm">Thông tin bàn tiệc và sơ đồ khán phòng sẽ được cập nhật gần ngày cưới.</p>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-full p-2 flex justify-between items-center z-50">
                <button 
                    onClick={() => setActiveTab("home")}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all ${activeTab === "home" ? "bg-rose-600 text-white shadow-lg scale-105" : "text-gray-400"}`}
                >
                    <Camera size={20} />
                    <span className="text-[10px] font-bold uppercase">Check-in</span>
                </button>
                <button 
                    onClick={() => setActiveTab("album")}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all ${activeTab === "album" ? "bg-rose-600 text-white shadow-lg scale-105" : "text-gray-400"}`}
                >
                    <Image size={20} />
                    <span className="text-[10px] font-bold uppercase">Album</span>
                </button>
                <button 
                    onClick={() => setActiveTab("wishes")}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all ${activeTab === "wishes" ? "bg-rose-600 text-white shadow-lg scale-105" : "text-gray-400"}`}
                >
                    <Heart size={20} />
                    <span className="text-[10px] font-bold uppercase">Chúc mừng</span>
                </button>
                <button 
                    onClick={() => setActiveTab("map")}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all ${activeTab === "map" ? "bg-rose-600 text-white shadow-lg scale-105" : "text-gray-400"}`}
                >
                    <Map size={20} />
                    <span className="text-[10px] font-bold uppercase">Vị trí</span>
                </button>
            </div>

            <SupportChat guestId={guestId} guestName={guestName || ""} />
        </div>
    );
}
