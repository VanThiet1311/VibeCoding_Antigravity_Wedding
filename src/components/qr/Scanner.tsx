"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw } from "lucide-react";

import { Html5Qrcode } from "html5-qrcode";

interface ScannerProps {
    onScan: (token: string) => void;
    isProcessing: boolean;
}

export default function QRScanner({ onScan, isProcessing }: ScannerProps) {
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let scanner: Html5Qrcode | null = null;

        const startScanner = async () => {
            try {
                if (!scannerRef.current) return;

                const qr = new Html5Qrcode("qr-reader");
                html5QrRef.current = qr;
                scanner = qr;

                await qr.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        onScan(decodedText);
                    },
                    () => { } // Ignored search errors
                );
                setError(null);
            } catch (err) {
                console.error("Camera start error:", err);
                setError("Không thể khởi động camera. Vui lòng cấp quyền truy cập.");
            }
        };

        startScanner();

        return () => {
            if (scanner?.isScanning) {
                scanner.stop().catch(() => { });
            }
        };
    }, [onScan]);

    return (
        <div className="w-full rounded-2xl overflow-hidden border border-rose-100 bg-white shadow-xl relative aspect-square">
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-rose-50 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-rose-500" />
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Máy quét QR</span>
                </div>
                {isProcessing && <RefreshCw className="w-4 h-4 text-rose-500 animate-spin" />}
            </div>

            {error ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                    <p className="mb-4 text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-rose-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-md transition-all active:scale-95"
                    >
                        Thử lại
                    </button>
                </div>
            ) : (
                <div
                    id="qr-reader"
                    ref={scannerRef}
                    className="w-full h-full"
                />
            )}

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-rose-500/50 rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-rose-500 rounded-tl-2xl -translate-x-1 -translate-y-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-rose-500 rounded-tr-2xl translate-x-1 -translate-y-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-rose-500 rounded-bl-2xl -translate-x-1 translate-y-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-rose-500 rounded-br-2xl translate-x-1 translate-y-1"></div>
                </div>
            </div>
        </div>
    );
}
