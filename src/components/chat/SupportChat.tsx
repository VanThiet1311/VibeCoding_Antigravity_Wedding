"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button, Input, Avatar } from "antd";

interface SupportChatProps {
    guestId: string;
    guestName: string;
}

interface ISupportMessage {
    sender: string;
    content: string;
    createdAt: string | Date;
}

export default function SupportChat({ guestId, guestName }: SupportChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ISupportMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/support?guestId=${guestId}`);
            if (res.ok) {
                const data: ISupportMessage[] = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Chat fetch error:", err);
        }
    }, [guestId]);

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId,
                    content: inputValue,
                    sender: "guest"
                })
            });
            if (res.ok) {
                setInputValue("");
                fetchMessages();
            }
        } catch (err) {
            console.error("Chat send error:", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white w-80 h-[450px] rounded-2xl shadow-2xl border border-rose-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="bg-rose-400">R</Avatar>
                            <div>
                                <p className="text-xs font-medium leading-none opacity-80">Hỗ trợ sự kiện</p>
                                <p className="text-sm font-bold">Lễ tân trực tuyến</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-rose-700 p-1 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
                        {messages.length === 0 ? (
                            <div className="text-center py-10">
                                <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">Xin chào {guestName},<br />Bạn cần hỗ trợ gì không?</p>
                            </div>
                        ) : (
                            messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.sender === "guest" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === "guest"
                                            ? "bg-rose-600 text-white rounded-tr-none"
                                            : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none"
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <Input
                            placeholder="Nhập nội dung..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onPressEnter={handleSendMessage}
                            className="rounded-full border-gray-200 focus:border-rose-500 shadow-none"
                        />
                        <Button
                            type="primary"
                            shape="circle"
                            icon={sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="bg-rose-600 border-none flex items-center justify-center"
                        />
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-all transform hover:scale-110 flex items-center justify-center animate-bounce-subtle"
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
}
