"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function DesignerPage() {
    const previewRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        groomName: "James Doe",
        brideName: "Jane Smith",
        date: "Saturday, 25th of May 2026",
        time: "4:00 PM",
        location: "The Grand Hotel, New York",
        message: "Together with their families, we invite you to celebrate the marriage of",
    });

    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async (format: 'a5' | 'a6') => {
        if (!previewRef.current) return;
        try {
            setIsExporting(true);
            const canvas = await html2canvas(previewRef.current, { scale: 3 });
            const imgData = canvas.toDataURL("image/png");

            const pdfFormat = format === 'a5' ? [148, 210] : [105, 148]; // width, height in mm

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: pdfFormat
            });

            pdf.addImage(imgData, "PNG", 0, 0, pdfFormat[0], pdfFormat[1]);
            pdf.save(`wedding_invitation_${format}.pdf`);
        } catch (err) {
            console.error("Export failed", err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <nav className="bg-surface border-b border-border px-4 py-4 flex justify-between items-center sm:px-6 lg:px-8">
                <h1 className="text-xl font-serif font-bold text-foreground">Card Designer</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleExportPDF('a6')}
                        disabled={isExporting}
                        className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-md hover:bg-surface transition disabled:opacity-50"
                    >
                        Export A6 PDF
                    </button>
                    <button
                        onClick={() => handleExportPDF('a5')}
                        disabled={isExporting}
                        className="px-4 py-2 bg-wedding-600 text-white text-sm font-medium rounded-md hover:bg-wedding-700 transition disabled:opacity-50"
                    >
                        {isExporting ? "Exporting..." : "Export A5 PDF"}
                    </button>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6 bg-surface border border-border p-6 rounded-xl shadow-sm h-fit">
                    <h3 className="text-lg font-medium text-foreground">Content Editor</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground/70 mb-1">Introduction Message</label>
                            <textarea
                                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-wedding-500 focus:border-wedding-500 text-sm"
                                rows={3}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground/70 mb-1">Groom&apos;s Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                                    value={formData.groomName}
                                    onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/70 mb-1">Bride&apos;s Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                                    value={formData.brideName}
                                    onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/70 mb-1">Date</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/70 mb-1">Time</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/70 mb-1">Location</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 flex justify-center items-start bg-grid-slate-100 p-8 border border-border rounded-xl">
                    {/* Aspect ratio A5 = 1 / 1.414 */}
                    <div
                        ref={previewRef}
                        className="bg-white shadow-2xl relative flex flex-col items-center justify-center p-12 text-center"
                        style={{ width: '400px', height: '566px' }} // Approximate A5 scale for web view
                    >
                        {/* Decorative border */}
                        <div className="absolute inset-4 border border-wedding-200"></div>
                        <div className="absolute inset-5 border border-wedding-200"></div>

                        <div className="z-10 flex flex-col items-center max-w-[80%]">
                            <p className="text-sm uppercase tracking-widest text-wedding-700 mb-8 font-sans">{formData.message}</p>

                            <h2 className="text-4xl font-serif text-foreground mb-4">{formData.groomName}</h2>
                            <p className="text-xl italic text-wedding-500 font-serif mb-4">and</p>
                            <h2 className="text-4xl font-serif text-foreground mb-12">{formData.brideName}</h2>

                            <div className="space-y-2 mb-8">
                                <p className="font-medium text-foreground tracking-wide font-sans">{formData.date}</p>
                                <p className="text-sm text-foreground/80 font-sans">{formData.time}</p>
                            </div>

                            <p className="text-sm font-serif italic text-foreground tracking-wider leading-relaxed">
                                {formData.location}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
