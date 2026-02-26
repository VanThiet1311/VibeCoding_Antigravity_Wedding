"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, Loader2, Camera } from "lucide-react";
import QRScanner from "@/components/qr/Scanner";
import SupportChat from "@/components/chat/SupportChat";

interface InvitationClientProps {
    guestId: string;
    guestName?: string;
    invitationId?: string;
}

export default function InvitationClient({ guestId, guestName, invitationId }: InvitationClientProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanResult, setScanResult] = useState<{ status: string; message: string } | null>(null);

    const handleScan = useCallback(async (checkpointToken: string) => {
        if (isProcessing || !guestId) return;
        setIsProcessing(true);

        try {
            // In the new self-scan model, the checkpointToken contains the ceremonyId
            // For now, we assume it's a JSON string or a simple ID for the checkpoint
            let ceremonyId = "";
            try {
                const payload = JSON.parse(checkpointToken);
                ceremonyId = payload.ceremonyId;
            } catch {
                ceremonyId = checkpointToken; // Fallback if it's just the ID
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
        <div className="space-y-6 max-w-md mx-auto">
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{guestName}</h2>
                <p className="text-gray-500 text-sm">Mã mời: {invitationId}</p>
            </div>

            {scanResult ? (
                <div className={`p-8 rounded-3xl text-center space-y-4 animate-in fade-in zoom-in duration-300 ${scanResult.status === "success" ? "bg-emerald-50 border border-emerald-200" :
                    scanResult.status === "info" ? "bg-blue-50 border border-blue-200" :
                        "bg-rose-50 border border-rose-200"
                    }`}>
                    {scanResult.status === "success" && <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />}
                    {scanResult.status === "info" && <CheckCircle className="w-16 h-16 text-blue-500 mx-auto" />}
                    {scanResult.status === "error" && <XCircle className="w-16 h-16 text-rose-500 mx-auto" />}

                    <h3 className={`text-xl font-bold ${scanResult.status === "success" ? "text-emerald-800" :
                        scanResult.status === "info" ? "text-blue-800" :
                            "text-rose-800"
                        }`}>
                        {scanResult.status === "success" ? "Thành công!" :
                            scanResult.status === "info" ? "Thông báo" : "Thất bại"}
                    </h3>
                    <p className="text-gray-600">{scanResult.message}</p>

                    <button
                        onClick={() => setScanResult(null)}
                        className="mt-4 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Quét lại
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-rose-600 p-4 rounded-2xl text-white text-center flex items-center justify-center gap-2">
                        <Camera size={20} />
                        <span className="font-medium">Quét mã QR tại cổng</span>
                    </div>
                    <div className="relative aspect-square">
                        <QRScanner onScan={handleScan} isProcessing={isProcessing} />
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-2xl">
                                <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
                                <span className="text-white text-sm font-medium">Đang xử lý check-in...</span>
                            </div>
                        )}
                    </div>
                    <p className="text-center text-xs text-gray-400 px-4">
                        Vui lòng hướng camera về phía mã QR được đặt tại quầy lễ tân.
                    </p>
                </div>
            )}
            <SupportChat guestId={guestId} guestName={guestName || ""} />
        </div>
    );
}
