"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Plus, Trash2, Link } from "lucide-react";

interface Person {
    _id: string;
    fullName: string;
    displayName: string;
    phone?: string;
    familyGroup: string;
}

const FAMILY_GROUP_LABELS: Record<string, string> = {
    gia_dinh: "Gia đình",
    ban_be: "Bạn bè",
    dong_nghiep: "Đồng nghiệp",
    ho_hang: "Họ hàng",
    khac: "Khác",
};

export default function FamilyPage() {
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ fullName: "", displayName: "", phone: "", familyGroup: "gia_dinh" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState<string | undefined>();

    const fetchPeople = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch session info for RBAC
            const meRes = await fetch("/api/auth/me");
            if (meRes.ok) {
                const meData = await meRes.json();
                setUserRole(meData.role);
            }

            const res = await fetch("/api/people");
            const data = await res.json();
            setPeople(Array.isArray(data) ? data : data.people ?? []);
        } catch {
            setError("Không thể tải danh sách.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPeople(); }, [fetchPeople]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/people", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Lỗi khi tạo.");
            }
            setShowForm(false);
            setForm({ fullName: "", displayName: "", phone: "", familyGroup: "gia_dinh" });
            await fetchPeople();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Xác nhận xoá?")) return;
        try {
            await fetch(`/api/people/${id}`, { method: "DELETE" });
            await fetchPeople();
        } catch {
            setError("Không thể xoá.");
        }
    };

    const grouped: Record<string, Person[]> = {};
    for (const p of people) {
        const g = p.familyGroup || "khac";
        if (!grouped[g]) grouped[g] = [];
        grouped[g].push(p);
    }

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-3xl text-gray-800 font-bold">Sơ đồ gia đình</h1>
                        <p className="text-gray-500 text-sm mt-1">Quản lý người và mối quan hệ.</p>
                    </div>
                    <button
                        onClick={() => setShowForm((s) => !s)}
                        className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" /> Thêm người
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}

                {/* Add person form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="bg-white border border-rose-100 rounded-xl p-5 shadow-soft space-y-3">
                        <h3 className="font-semibold text-gray-800">Thêm người mới</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Họ và tên *</label>
                                <input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400" placeholder="Nguyễn Văn A" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Tên hiển thị *</label>
                                <input required value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400" placeholder="Anh A" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Điện thoại</label>
                                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400" placeholder="0901..." />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Nhóm</label>
                                <select value={form.familyGroup} onChange={e => setForm(f => ({ ...f, familyGroup: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400">
                                    {Object.entries(FAMILY_GROUP_LABELS).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Huỷ</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50">
                                {saving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </form>
                )}

                {/* People list grouped */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400">Đang tải...</div>
                ) : people.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-rose-50 shadow-soft">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Chưa có ai trong danh sách.</p>
                        <p className="text-gray-400 text-sm mt-1">Bấm &quot;Thêm người&quot; để bắt đầu.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(grouped).map(([group, persons]) => (
                            <div key={group} className="bg-white rounded-xl border border-rose-50 shadow-soft overflow-hidden">
                                <div className="px-5 py-3 border-b border-rose-50 bg-rose-50/40 flex items-center gap-2">
                                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                                        {FAMILY_GROUP_LABELS[group] ?? group}
                                    </span>
                                    <span className="text-xs text-gray-400">({persons.length})</span>
                                </div>
                                <ul className="divide-y divide-rose-50">
                                    {persons.map((p) => (
                                        <li key={p._id} className="px-5 py-3 flex items-center justify-between hover:bg-rose-50/30 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{p.fullName}</p>
                                                <p className="text-xs text-gray-400">{p.displayName}{p.phone ? ` · ${p.phone}` : ""}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button title="Liên kết quan hệ" className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                                                    <Link className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(p._id)} title="Xoá" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
