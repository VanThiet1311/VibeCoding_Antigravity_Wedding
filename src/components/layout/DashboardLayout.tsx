"use client";

import React from "react";
import { Layout, Menu } from "antd";
import { Users, Mail, LayoutDashboard, Settings, PenTool, LogOut, Shield, Calendar, Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole?: string;
}

/**
 * DashboardLayout
 * The main authenticated layout containing the side navigation (Ant Design Menu),
 * header with logout/profile, and the central content area.
 */
export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { key: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Tổng quan" },
        { key: "/dashboard/weddings", icon: <PenTool size={18} />, label: "Đám cưới của tôi" },
        { key: "/dashboard/ceremonies", icon: <Calendar size={18} />, label: "Danh sách nghi lễ" },
        { key: "/dashboard/guests", icon: <Users size={18} />, label: "Quản lý khách mời" },
        { key: "/dashboard/family", icon: <Heart size={18} />, label: "Sơ đồ gia đình" },
        { key: "/dashboard/support", icon: <Mail size={18} />, label: "Hỗ trợ khách" },
        { key: "/dashboard/album", icon: <Settings size={18} />, label: "Lịch sử đi tiệc" },
        { key: "/dashboard/card", icon: <PenTool size={18} />, label: "Thiệp mời" },
    ];

    if (userRole === "admin") {
        menuItems.push({
            key: "/admin",
            icon: <Shield size={18} className="text-rose-500" />,
            label: "Quản lý tài khoản"
        });
    }

    return (
        <Layout className="min-h-screen bg-champagne-light">
            <Sider
                width={250}
                theme="light"
                breakpoint="lg"
                collapsedWidth="0"
                className="shadow-soft z-10 border-r border-rose-50"
            >
                <Link href="/dashboard" className="p-6 text-center border-b border-rose-50 flex items-center justify-center gap-2 transition-colors hover:bg-rose-50/30">
                    <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-serif italic text-lg shadow-sm">
                        W
                    </div>
                    <h1 className="font-serif text-xl text-rose-600 font-bold tracking-wide mb-0 hidden md:block">
                        Manager
                    </h1>
                </Link>
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    onClick={(e) => router.push(e.key)}
                    className="border-none mt-4 font-sans px-2"
                />
            </Sider>
            <Layout className="bg-transparent">
                <Header className="bg-white/80 backdrop-blur-md border-b border-rose-50 px-6 flex items-center justify-end shadow-sm">
                    <button
                        onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            router.push('/login');
                            router.refresh();
                        }}
                        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-rose-600 transition-colors"
                    >
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </Header>
                <Content className="p-4 md:p-8 lg:p-10 mx-auto w-full max-w-6xl">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
