"use client";

import { useState, useEffect, useCallback } from "react";
import { Input, List, Card, Tag, Avatar, Empty, Spin } from "antd";
import { Search, User, Phone, MapPin, CheckCircle, QrCode, Loader2, LogIn } from "lucide-react";
import QRScanner from "@/components/qr/Scanner";
import { message as antMessage } from "antd";
import debounce from "lodash/debounce";

interface IGuestSearchResult {
    _id: string;
    personId: {
        fullName: string;
        phone?: string;
    };
    attendanceStatus: string;
    ceremonyId?: {
        _id: string;
        name: string;
    };
    tableName?: string;
    companionsCount?: number;
}

export default function ReceptionClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<IGuestSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (q: string) => {
            if (q.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`/api/reception/search?q=${encodeURIComponent(q)}`);
                if (res.ok) {
                    const data: IGuestSearchResult[] = await res.json();
                    setResults(data);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    const handleCheckIn = async (guestId: string, ceremonyId: string) => {
        setIsCheckingIn(guestId);
        try {
            const res = await fetch("/api/reception/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId,
                    ceremonyId,
                    deviceId: "staff-manual",
                }),
            });

            const data = await res.json();
            if (data.status === "FIRST_CHECKIN" || data.status === "ADDITIONAL_CHECKIN") {
                antMessage.success("Check-in thành công!");
                // Update local state
                setResults(prev => prev.map(g => g._id === guestId ? { ...g, attendanceStatus: "arrived" } : g));
            } else if (data.status === "ALREADY_CHECKED_IN") {
                antMessage.info("Khách đã check-in rồi.");
            } else {
                antMessage.error(data.message || "Lỗi check-in");
            }
        } catch (error) {
            console.error("Check-in error:", error);
            antMessage.error("Lỗi kết nối server");
        } finally {
            setIsCheckingIn(null);
        }
    };

    const handleQRScan = async (token: string) => {
        setIsScanning(false);
        setLoading(true);
        try {
            const res = await fetch("/api/reception/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    deviceId: "staff-scan",
                }),
            });

            const data = await res.json();
            if (data.status === "FIRST_CHECKIN" || data.status === "ADDITIONAL_CHECKIN") {
                antMessage.success(`Check-in thành công: ${data.guest.personId?.fullName || "Khách"}`);
            } else if (data.status === "ALREADY_CHECKED_IN") {
                antMessage.info("Khách đã check-in rồi.");
            } else {
                antMessage.error(data.message || "Lỗi check-in");
            }
        } catch (error) {
            console.error("Scan error:", error);
            antMessage.error("Lỗi xử lý mã QR");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        debouncedSearch(searchQuery);
    }, [searchQuery, debouncedSearch]);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-white">Lễ tân - Tiếp đón khách</h1>
                    <p className="text-gray-400">Tìm khách bằng tên hoặc quét mã QR.</p>
                </div>
                <button
                    onClick={() => setIsScanning(!isScanning)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isScanning ? 'bg-rose-100 text-rose-600' : 'bg-rose-600 text-white hover:bg-rose-500'
                        }`}
                >
                    <QrCode size={20} />
                    {isScanning ? "Đóng Scanner" : "Mở Scanner"}
                </button>
            </div>

            {isScanning && (
                <div className="bg-gray-900 p-6 rounded-2xl border border-rose-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="max-w-xs mx-auto aspect-square relative">
                        <QRScanner onScan={handleQRScan} isProcessing={loading} />
                    </div>
                    <p className="text-center text-gray-400 mt-4 text-sm">Hướng camera vào mã QR trên điện thoại của khách</p>
                </div>
            )}

            <Input
                prefix={<Search className="text-gray-400 mr-2" size={20} />}
                placeholder="Nhập tên khách hoặc số điện thoại..."
                size="large"
                className="rounded-xl h-14 text-lg bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 focus:border-rose-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
            />

            {loading ? (
                <div className="flex justify-center p-12">
                    <Spin size="large" />
                </div>
            ) : results.length > 0 ? (
                <List
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={results}
                    renderItem={(item) => (
                        <List.Item>
                            <Card className="rounded-2xl bg-gray-900 border-gray-800 hover:border-rose-500/50 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <Avatar size={64} icon={<User />} className="bg-rose-100 text-rose-600" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-xl font-bold text-white m-0">
                                                {item.personId.fullName}
                                            </h3>
                                            <Tag color={item.attendanceStatus === "arrived" ? "green" : "default"} className="rounded-full">
                                                {item.attendanceStatus === "arrived" ? "Đã đến" : "Chưa đến"}
                                            </Tag>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-gray-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} />
                                                {item.personId.phone || "Không có SĐT"}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} />
                                                {item.ceremonyId?.name || "N/A"}
                                            </div>
                                            {item.tableName && (
                                                <div className="flex items-center gap-2 text-rose-400 font-medium">
                                                    <CheckCircle size={14} />
                                                    Bàn: {item.tableName}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Số người</p>
                                            <p className="text-2xl font-bold text-white leading-none">
                                                {1 + (item.companionsCount || 0)}
                                            </p>
                                        </div>
                                        {item.attendanceStatus !== "arrived" && (
                                            <button
                                                disabled={isCheckingIn === item._id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCheckIn(item._id, item.ceremonyId?._id || "");
                                                }}
                                                className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-500 transition-colors flex items-center gap-1 text-sm font-bold shadow-sm"
                                            >
                                                {isCheckingIn === item._id ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                                                Check-in
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : searchQuery.length >= 2 ? (
                <Empty description={<span className="text-gray-500">Không tìm thấy khách mời phù hợp</span>} className="py-12" />
            ) : null}
        </div>
    );
}
