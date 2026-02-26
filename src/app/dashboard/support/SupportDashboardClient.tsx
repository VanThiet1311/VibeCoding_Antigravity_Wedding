"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { List, Avatar, Input, Button, Badge, Skeleton, Empty } from "antd";
import { Send, MessageSquare } from "lucide-react";
import moment from "moment";

interface ISupportSession {
    _id: string;
    personInfo: {
        fullName: string;
    };
    unreadCount: number;
    timestamp: string | Date;
    lastSender: string;
    lastMessage: string;
}

interface ISupportMessage {
    sender: string;
    content: string;
    createdAt: string | Date;
}

export default function SupportDashboardClient() {
    const [sessions, setSessions] = useState<ISupportSession[]>([]);
    const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ISupportMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/support/sessions");
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (err) {
            console.error("Sessions fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = useCallback(async () => {
        if (!activeGuestId) return;
        try {
            const res = await fetch(`/api/support?guestId=${activeGuestId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Messages fetch error:", err);
        }
    }, [activeGuestId]);

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeGuestId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [activeGuestId, fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !activeGuestId) return;
        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId: activeGuestId,
                    content: inputValue,
                    sender: "staff"
                })
            });
            if (res.ok) {
                setInputValue("");
                fetchMessages();
            }
        } catch (err) {
            console.error("Send error:", err);
        }
    };

    const activeSession = sessions.find(s => s._id === activeGuestId);

    return (
        <div className="h-[calc(100vh-180px)] bg-white rounded-3xl border border-rose-100 shadow-soft overflow-hidden flex">
            {/* Session List */}
            <div className="w-80 border-r border-rose-50 flex flex-col">
                <div className="p-4 border-b border-rose-50 font-serif font-bold text-lg text-rose-600">
                    Hỗ trợ trực tuyến
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            <Skeleton avatar active paragraph={{ rows: 1 }} />
                            <Skeleton avatar active paragraph={{ rows: 1 }} />
                        </div>
                    ) : sessions.length === 0 ? (
                        <Empty description="Chưa có cuộc hội thoại nào" className="mt-20" />
                    ) : (
                        <List
                            dataSource={sessions}
                            renderItem={(item) => (
                                <div
                                    onClick={() => setActiveGuestId(item._id)}
                                    className={`p-4 border-b border-rose-50 cursor-pointer transition-colors ${activeGuestId === item._id ? "bg-rose-50" : "hover:bg-neutral-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge count={item.unreadCount} offset={[-2, 32]}>
                                            <Avatar className="bg-rose-100 text-rose-600">
                                                {item.personInfo.fullName.charAt(0)}
                                            </Avatar>
                                        </Badge>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="text-sm font-bold text-gray-800 truncate m-0">
                                                    {item.personInfo.fullName}
                                                </p>
                                                <p className="text-[10px] text-gray-400 m-0">
                                                    {moment(item.timestamp).fromNow()}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate m-0 italic">
                                                {item.lastSender === "staff" ? "Bạn: " : ""}
                                                {item.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-neutral-50">
                {activeGuestId ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-rose-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="bg-rose-100 text-rose-600">
                                    {activeSession?.personInfo.fullName.charAt(0)}
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 m-0">
                                        {activeSession?.personInfo.fullName}
                                    </p>
                                    <p className="text-xs text-emerald-600 m-0">Đang trực tuyến</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.sender === "staff" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${m.sender === "staff"
                                            ? "bg-rose-600 text-white rounded-tr-none"
                                            : "bg-white text-gray-800 border border-rose-100 rounded-tl-none"
                                        }`}>
                                        {m.content}
                                        <p className={`text-[10px] mt-1.5 opacity-60 ${m.sender === "staff" ? "text-right" : "text-left"}`}>
                                            {moment(m.createdAt).format("HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-rose-50 flex gap-3 items-center">
                            <Input
                                placeholder="Nhập câu trả lời..."
                                size="large"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={handleSendMessage}
                                className="rounded-xl border-rose-100 shadow-none focus:border-rose-500"
                            />
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleSendMessage}
                                icon={<Send size={18} />}
                                disabled={!inputValue.trim()}
                                className="bg-rose-600 border-none flex items-center justify-center rounded-xl"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                        <MessageSquare size={64} className="text-rose-200 mb-4" />
                        <p className="text-gray-500 font-medium">Chọn một hội thoại để bắt đầu hỗ trợ</p>
                    </div>
                )}
            </div>
        </div>
    );
}
