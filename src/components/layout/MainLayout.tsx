import React from "react";
import { Layout } from "antd";

const { Header, Content, Footer } = Layout;

/**
 * MainLayout
 * Generic wrapper for public-facing pages that are not authenticated,
 * adhering to the elegant wedding theme with soft shadows and rose accents.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout className="min-h-screen bg-champagne-light">
            <Header className="bg-white border-b border-rose-50 flex items-center justify-between px-6">
                <div className="font-serif text-2xl text-rose-600 font-bold tracking-wide">
                    WeddingManager
                </div>
            </Header>
            <Content className="p-6 md:p-12 max-w-7xl mx-auto w-full">
                {children}
            </Content>
            <Footer className="text-center text-neutral-500 text-sm bg-transparent">
                Wedding Invitation Manager ©{new Date().getFullYear()}
            </Footer>
        </Layout>
    );
}
