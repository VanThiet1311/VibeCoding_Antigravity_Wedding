"use client";

import React from "react";
import { Table, Tag, Typography, Empty } from "antd";
import { format } from "date-fns";
import { Heart } from "lucide-react";
import { IWedding } from "@/models/Wedding";

const { Text } = Typography;

interface WeddingListProps {
    weddings: IWedding[];
}

export default function WeddingList({ weddings }: WeddingListProps) {
    const columns = [
        {
            title: "Cô dâu",
            dataIndex: "brideName",
            key: "brideName",
            render: (text: string) => <Text strong className="text-rose-600">{text}</Text>,
        },
        {
            title: "Chú rể",
            dataIndex: "groomName",
            key: "groomName",
            render: (text: string) => <Text strong className="text-rose-600">{text}</Text>,
        },
        {
            title: "Ngày cưới",
            dataIndex: "weddingDate",
            key: "weddingDate",
            render: (date: string) => format(new Date(date), "dd/MM/yyyy"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const color = status === "da_hoan_thanh" ? "green" : "blue";
                const label = status === "da_hoan_thanh" ? "Hoàn thành" : "Đang chuẩn bị";
                return <Tag color={color}>{label}</Tag>;
            },
        },
    ];

    if (weddings.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center">
                <Empty
                    image={<Heart className="w-16 h-16 text-rose-100 mx-auto" />}
                    description={
                        <div className="text-center">
                            <Text type="secondary" className="block text-lg">Chưa có đám cưới nào được tạo</Text>
                            <Text type="secondary">Hãy bắt đầu bằng cách thêm thông tin đám cưới mới.</Text>
                        </div>
                    }
                />
            </div>
        );
    }

    return (
        <Table
            columns={columns}
            dataSource={weddings.map(w => ({ ...w, key: w._id }))}
            pagination={false}
            className="ant-table-custom"
        />
    );
}
