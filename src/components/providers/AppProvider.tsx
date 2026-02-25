"use client";

import React from "react";
import { ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { weddingTheme } from "@/styles/theme";

/**
 * Global AppProvider
 * Wraps the application with Ant Design registry for Next.js App Router (SSR compatibility)
 * and globally applies the custom wedding theme to all Ant Design components.
 */
export default function AppProvider({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <ConfigProvider theme={weddingTheme}>
                {children}
            </ConfigProvider>
        </AntdRegistry>
    );
}
