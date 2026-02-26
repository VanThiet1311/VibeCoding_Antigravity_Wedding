"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { QrCode, Users, Plus, FileDown, Loader2 } from "lucide-react";
import { Modal } from "antd";
import QRCodeView from "@/components/qr/QRCodeView";

interface Guest {
    _id: string;
    personId: { fullName: string; displayName: string } | string;
    invitedSide: string;
    status: string;
    attendanceStatus: string;
    tableName?: string;
    companionsCount: number;
    checkInTime?: string;
}

const STATUS_LABELS: Record<string, string> = {
    cho_xac_nhan: "Chờ xác nhận",
    tham_gia: "Tham gia",
    tu_choi: "Từ chối",
};

const ATTENDANCE_LABELS: Record<string, { label: string; color: string }> = {
    invited: { label: "Chưa đến", color: "text-gray-500 bg-gray-100" },
    confirmed: { label: "Xác nhận", color: "text-rose-700 bg-rose-50" },
    arrived: { label: "Đã đến", color: "text-emerald-700 bg-emerald-100" },
    seated: { label: "Đã ngồi", color: "text-blue-700 bg-blue-100" },
    left: { label: "Đã về", color: "text-gray-600 bg-gray-200" },
};

export default function GuestsPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<"all" | "nha_trai" | "nha_gai">("all");
    const [exportingPdf, setExportingPdf] = useState(false);
    const [userRole, setUserRole] = useState<string | undefined>();
    const [selectedGuestQr, setSelectedGuestQr] = useState<{ token: string; name: string } | null>(null);
    const [loadingQr, setLoadingQr] = useState(false);

    const fetchGuests = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch session info for RBAC
            const meRes = await fetch("/api/auth/me");
            if (meRes.ok) {
                const meData = await meRes.json();
                setUserRole(meData.role);
            }

            const res = await fetch("/api/guests?populate=true");
            if (!res.ok) throw new Error("Lỗi tải danh sách.");
            const data = await res.json();
            setGuests(Array.isArray(data) ? data : data.guests ?? []);
        } catch {
            setError("Không thể tải danh sách khách.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchGuests(); }, [fetchGuests]);

    const handleExportPdf = async () => {
        setExportingPdf(true);
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Danh sách phân bàn", 10, 15);
            doc.setFontSize(10);
            const filtered = filter === "all" ? guests : guests.filter(g => g.invitedSide === filter);
            let y = 28;
            doc.text("Tên | Bàn | Số người | Trạng thái", 10, y);
            y += 6;
            doc.line(10, y, 200, y);
            y += 4;
            for (const g of filtered) {
                const name = typeof g.personId === "object" ? g.personId.fullName : "—";
                const table = g.tableName || "Chưa phân";
                const companions = g.companionsCount;
                const att = ATTENDANCE_LABELS[g.attendanceStatus]?.label ?? g.attendanceStatus;
                doc.text(`${name} | ${table} | ${companions} | ${att}`, 10, y);
                y += 6;
                if (y > 280) { doc.addPage(); y = 15; }
            }
            doc.save("danh-sach-phan-ban.pdf");
        } catch {
            setError("Không thể xuất PDF.");
        } finally {
            setExportingPdf(false);
        }
    };

    const filtered = filter === "all" ? guests : guests.filter(g => g.invitedSide === filter);

    const getPersonName = (g: Guest): string => {
        if (typeof g.personId === "object" && g.personId !== null) {
            return g.personId.fullName;
        }
        return "—";
    };

    const updateAttendance = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/guests/${id}/attendance`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) fetchGuests();
        } catch {
            setError("Lỗi cập nhật trạng thái.");
        }
    };

    const handleShowQr = async (guest: Guest) => {
        setLoadingQr(true);
        try {
            const res = await fetch(`/api/guests/${guest._id}/qr`);
            if (res.ok) {
                const data = await res.json();
                setSelectedGuestQr({ token: data.token, name: getPersonName(guest) });
            } else {
                setError("Không thể tạo mã QR.");
            }
        } catch {
            setError("Lỗi kết nối khi tạo mã QR.");
        } finally {
            setLoadingQr(false);
        }
    };

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="font-serif text-3xl text-gray-800 font-bold">Danh sách khách</h1>
                        <p className="text-gray-500 text-sm mt-1">Phân bàn, tạo QR và xuất danh sách.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportPdf}
                            disabled={exportingPdf}
                            className="flex items-center gap-2 border border-rose-200 text-rose-600 px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <FileDown className="w-4 h-4" />
                            {exportingPdf ? "Đang xuất..." : "Xuất PDF"}
                        </button>
                        <button
                            onClick={() => alert("Tính năng thêm khách sẽ yêu cầu chọn ceremony.")}
                            className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> Thêm khách
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}

                {/* Filter tabs */}
                <div className="flex gap-1 bg-rose-50 p-1 rounded-lg w-fit">
                    {(["all", "nha_trai", "nha_gai"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {f === "all" ? "Tất cả" : f === "nha_trai" ? "Nhà trai" : "Nhà gái"}
                        </button>
                    ))}
                </div>

                {/* Guest Table */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-rose-50 shadow-soft">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Chưa có khách mời nào.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-rose-50 shadow-soft overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-rose-50 bg-rose-50/40">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nhà</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bàn</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Người đi kèm</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">RSVP</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Check-in</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-50">
                                    {filtered.map((g) => {
                                        const att = ATTENDANCE_LABELS[g.attendanceStatus] ?? { label: g.attendanceStatus, color: "text-gray-500 bg-gray-100" };
                                        return (
                                            <tr key={g._id} className="hover:bg-rose-50/30 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-800">{getPersonName(g)}</td>
                                                <td className="px-4 py-3 text-gray-500">{g.invitedSide === "nha_trai" ? "Nhà trai" : "Nhà gái"}</td>
                                                <td className="px-4 py-3 text-gray-600">{g.tableName || <span className="text-gray-300">—</span>}</td>
                                                <td className="px-4 py-3 text-gray-600">{g.companionsCount}</td>
                                                <td className="px-4 py-3 text-gray-500">{STATUS_LABELS[g.status] ?? g.status}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${att.color}`}>
                                                        {att.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        {g.attendanceStatus === "arrived" && (
                                                            <button
                                                                onClick={() => updateAttendance(g._id, "seated")}
                                                                className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-100 rounded-md hover:bg-blue-100"
                                                            >
                                                                Vào bàn
                                                            </button>
                                                        )}
                                                        {g.attendanceStatus === "seated" && (
                                                            <button
                                                                onClick={() => updateAttendance(g._id, "left")}
                                                                className="px-2 py-1 text-[10px] bg-gray-50 text-gray-600 border border-gray-100 rounded-md hover:bg-gray-100"
                                                            >
                                                                Đã về
                                                            </button>
                                                        )}
                                                        <button
                                                            title="Hiển thị QR"
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                            onClick={() => handleShowQr(g)}
                                                        >
                                                            <QrCode className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <Modal
                    open={!!selectedGuestQr || loadingQr}
                    onCancel={() => setSelectedGuestQr(null)}
                    footer={null}
                    closable={!loadingQr}
                    centered
                    width={400}
                    bodyStyle={{ padding: 0 }}
                >
                    {loadingQr ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                            <p className="text-gray-500 font-medium">Đang tạo mã QR...</p>
                        </div>
                    ) : selectedGuestQr && (
                        <QRCodeView 
                            token={selectedGuestQr.token} 
                            guestName={selectedGuestQr.name} 
                            size={250} 
                        />
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
}
