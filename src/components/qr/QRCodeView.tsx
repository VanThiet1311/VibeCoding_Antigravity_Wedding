"use client";

import React from "react";
import { QRCode, Card, Typography } from "antd";

const { Text } = Typography;

interface QRCodeViewProps {
    token: string;
    guestName?: string;
    size?: number;
}

export default function QRCodeView({ token, guestName, size = 200 }: QRCodeViewProps) {
    return (
        <Card
            className="w-full max-w-sm mx-auto shadow-lg border-rose-100"
            bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
            <div className="bg-white p-4 rounded-xl shadow-inner border border-rose-50">
                <QRCode
                    value={token}
                    size={size}
                    color="#e11d48" // rose-600
                    bordered={false}
                />
            </div>
            <div className="text-center">
                <Text strong className="block text-lg text-gray-800">{guestName || "Giấy mời điện tử"}</Text>
                <Text type="secondary" className="text-xs">Vui lòng xuất trình mã này tại quầy lễ tân</Text>
            </div>
        </Card>
    );
}
