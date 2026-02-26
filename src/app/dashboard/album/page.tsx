"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BookOpen, Plus, Gift, Calendar, Trash2 } from "lucide-react";

interface AlbumEntry {
    _id: string;
    personId: { fullName: string } | string;
    eventType: string;
    eventDate: string;
    location?: string;
    giftAmount?: number;
    giftType: string;
    attended: boolean;
    returnGiftPlanned: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
    dam_cuoi: "Đám cưới",
    dam_hoi: "Đám hỏi",
    sinh_nhat: "Sinh nhật",
    tan_gia: "Tân gia",
    thoi_noi: "Thôi nôi",
    khac: "Khác",
};

const GIFT_TYPE_LABELS: Record<string, string> = {
    tien_mat: "Tiền mặt",
    vang: "Vàng",
    qua_tang: "Quà tặng",
    khong_co: "Không có",
};

export default function AlbumPage() {
    const [entries, setEntries] = useState<AlbumEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState<string | undefined>();
    const [form, setForm] = useState({
        personId: "",
        eventType: "dam_cuoi",
        eventDate: "",
        location: "",
        giftAmount: "",
        giftType: "tien_mat",
        attended: true,
        returnGiftPlanned: false,
    });

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch session info for RBAC
            const meRes = await fetch("/api/auth/me");
            if (meRes.ok) {
                const meData = await meRes.json();
                setUserRole(meData.role);
            }

            const res = await fetch("/api/invitations");
            if (!res.ok) throw new Error();
            const data = await res.json();
            setEntries(Array.isArray(data) ? data : data.invitations ?? []);
        } catch {
            setError("Không thể tải lịch sử.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const body = {
                ...form,
                giftAmount: form.giftAmount ? Number(form.giftAmount) : 0,
            };
            const res = await fetch("/api/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || "Lỗi.");
            }
            setShowForm(false);
            await fetchEntries();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Xác nhận xoá?")) return;
        try {
            await fetch(`/api/invitations/${id}`, { method: "DELETE" });
            await fetchEntries();
        } catch {
            setError("Không thể xoá.");
        }
    };

    const getPersonName = (e: AlbumEntry) => {
        if (typeof e.personId === "object" && e.personId !== null) return e.personId.fullName;
        return "—";
    };

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-3xl text-gray-800 font-bold">Lịch sử đi tiệc</h1>
                        <p className="text-gray-500 text-sm mt-1">Theo dõi lịch thiệp và trả quà lại.</p>
                    </div>
                    <button
                        onClick={() => setShowForm((s) => !s)}
                        className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" /> Thêm
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}

                {showForm && (
                    <form onSubmit={handleCreate} className="bg-white border border-rose-100 rounded-xl p-5 shadow-soft space-y-3">
                        <h3 className="font-semibold text-gray-800">Thêm mục mới</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Người gửi thiệp (ID Person)</label>
                                <input required value={form.personId} onChange={e => setForm(f => ({ ...f, personId: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Person ObjectId..." />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Loại sự kiện</label>
                                <select value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                    {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Ngày sự kiện *</label>
                                <input required type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Địa điểm</label>
                                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Nhà hàng..." />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Loại quà</label>
                                <select value={form.giftType} onChange={e => setForm(f => ({ ...f, giftType: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                    {Object.entries(GIFT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Số tiền / Giá trị</label>
                                <input type="number" value={form.giftAmount} onChange={e => setForm(f => ({ ...f, giftAmount: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="500000" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" checked={form.attended} onChange={e => setForm(f => ({ ...f, attended: e.target.checked }))} />
                                Đã đi dự
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" checked={form.returnGiftPlanned} onChange={e => setForm(f => ({ ...f, returnGiftPlanned: e.target.checked }))} />
                                Cần trả quà lại
                            </label>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Huỷ</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50">
                                {saving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Đang tải...</div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-rose-50 shadow-soft">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Chưa có lịch sử đi tiệc.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries.map((entry) => (
                            <div key={entry._id} className="bg-white rounded-xl border border-rose-50 shadow-soft p-4 flex items-start justify-between gap-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-5 h-5 text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">{getPersonName(entry)} · {EVENT_TYPE_LABELS[entry.eventType] ?? entry.eventType}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(entry.eventDate).toLocaleDateString("vi-VN")}
                                            {entry.location ? ` · ${entry.location}` : ""}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {entry.giftType !== "khong_co" && (
                                                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                                    <Gift className="w-3 h-3" />
                                                    {GIFT_TYPE_LABELS[entry.giftType]}
                                                    {entry.giftAmount ? ` · ${entry.giftAmount.toLocaleString("vi-VN")}đ` : ""}
                                                </span>
                                            )}
                                            {entry.returnGiftPlanned && (
                                                <span className="inline-flex text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">Cần trả quà</span>
                                            )}
                                            {!entry.attended && (
                                                <span className="inline-flex text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Vắng mặt</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(entry._id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
