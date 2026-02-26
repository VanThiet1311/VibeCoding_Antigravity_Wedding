"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Eye, Download } from "lucide-react";

interface CardTemplate {
    _id: string;
    name: string;
    htmlContent: string;
    cssContent: string;
    isPublic: boolean;
}

export default function CardPage() {
    const [templates, setTemplates] = useState<CardTemplate[]>([]);
    const [selected, setSelected] = useState<CardTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [guestName, setGuestName] = useState("Kính mời Quý khách");
    const [exporting, setExporting] = useState(false);
    const [userRole, setUserRole] = useState<string | undefined>();

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch session info for RBAC
            const meRes = await fetch("/api/auth/me");
            if (meRes.ok) {
                const meData = await meRes.json();
                setUserRole(meData.role);
            }

            const res = await fetch("/api/templates");
            if (!res.ok) throw new Error();
            const data = await res.json();
            const tmpl = Array.isArray(data) ? data : data.templates ?? [];
            setTemplates(tmpl);
            if (tmpl.length > 0) setSelected(tmpl[0]);
        } catch {
            setError("Không thể tải mẫu thiệp.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    const getPreviewHtml = () => {
        if (!selected) return "";
        const withGuest = selected.htmlContent.replace(/{{guestName}}/g, guestName);
        return `<style>${selected.cssContent}</style>${withGuest}`;
    };

    const handleExportPdf = async () => {
        if (!selected) return;
        setExporting(true);
        try {
            const { default: html2canvas } = await import("html2canvas");
            const { jsPDF } = await import("jspdf");

            const iframe = document.getElementById("card-preview-iframe") as HTMLIFrameElement | null;
            const container = iframe?.contentDocument?.body;
            if (!container) throw new Error("Preview not ready.");

            const canvas = await html2canvas(container, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "landscape" });
            pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
            pdf.save(`${selected.name}-${guestName}.pdf`);
        } catch {
            setError("Không thể xuất PDF.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-3xl text-gray-800 font-bold">Thiết kế thiệp</h1>
                    <p className="text-gray-500 text-sm mt-1">Chọn mẫu thiệp và tự động điền thông tin khách.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Đang tải mẫu thiệp...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Template list */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mẫu thiệp</p>
                            {templates.length === 0 ? (
                                <div className="text-center py-8 bg-white rounded-xl border border-rose-50 shadow-soft">
                                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">Chưa có mẫu nào.</p>
                                    <p className="text-gray-300 text-xs mt-1">Tạo mẫu từ trang Admin.</p>
                                </div>
                            ) : (
                                templates.map((tmpl) => (
                                    <button
                                        key={tmpl._id}
                                        onClick={() => setSelected(tmpl)}
                                        className={`w-full text-left p-3 rounded-xl border transition-colors ${selected?._id === tmpl._id
                                            ? "border-rose-400 bg-rose-50"
                                            : "border-rose-50 bg-white hover:bg-rose-50/50"
                                            }`}
                                    >
                                        <p className={`text-sm font-medium ${selected?._id === tmpl._id ? "text-rose-700" : "text-gray-800"}`}>
                                            {tmpl.name}
                                        </p>
                                        {tmpl.isPublic && (
                                            <span className="text-xs text-rose-400">Mẫu công khai</span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Preview + Controls */}
                        <div className="lg:col-span-2 space-y-4">
                            {selected && (
                                <>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex-1 min-w-48">
                                            <label className="text-xs text-gray-500 mb-1 block">Tên khách (auto-fill)</label>
                                            <input
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                                                placeholder="Kính mời Quý khách..."
                                            />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <button
                                                className="flex items-center gap-1.5 border border-rose-200 text-rose-600 px-3 py-2 rounded-lg text-sm hover:bg-rose-50 transition-colors"
                                                onClick={() => {
                                                    const iframe = document.getElementById("card-preview-iframe") as HTMLIFrameElement;
                                                    if (iframe && iframe.contentDocument) {
                                                        iframe.contentDocument.open();
                                                        iframe.contentDocument.write(getPreviewHtml());
                                                        iframe.contentDocument.close();
                                                    }
                                                }}
                                            >
                                                <Eye className="w-4 h-4" /> Xem trước
                                            </button>
                                            <button
                                                onClick={handleExportPdf}
                                                disabled={exporting}
                                                className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-rose-700 transition-colors disabled:opacity-50"
                                            >
                                                <Download className="w-4 h-4" />
                                                {exporting ? "Đang xuất..." : "Xuất PDF"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card preview */}
                                    <div className="bg-white border border-rose-100 rounded-xl overflow-hidden shadow-soft">
                                        <div className="px-4 py-2 border-b border-rose-50 bg-rose-50/40 text-xs text-gray-500 flex items-center gap-2">
                                            <Eye className="w-3.5 h-3.5" /> Xem trước: {selected.name}
                                        </div>
                                        <iframe
                                            id="card-preview-iframe"
                                            title="Xem trước thiệp"
                                            className="w-full"
                                            style={{ height: "480px", border: "none" }}
                                            srcDoc={getPreviewHtml()}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
