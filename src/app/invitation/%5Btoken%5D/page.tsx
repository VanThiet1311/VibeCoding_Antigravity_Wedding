import React, { Suspense } from "react";
import GuestLayout from "@/components/layout/GuestLayout";
import InvitationClient from "../InvitationClient";
import { Loader2 } from "lucide-react";

interface Props {
    params: {
        token: string;
    };
}

interface IGuestTokenInfo {
    guestId: string;
    guestName: string;
    invitationId: string;
}

export default function DynamicInvitationPage({ params }: Props) {
    const { token } = params;

    // Decode token to get guest info
    let guestInfo: IGuestTokenInfo | null = null;
    try {
        const decoded = Buffer.from(token, "base64url").toString("utf-8");
        guestInfo = JSON.parse(decoded) as IGuestTokenInfo;
    } catch (e) {
        console.error("Failed to decode token", e);
    }

    return (
        <GuestLayout>
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-rose-100 shadow-soft">
                    <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Đang tải thông tin thiệp mời...</p>
                </div>
            }>
                <InvitationClient
                    guestId={guestInfo?.guestId ?? ""}
                    guestName={guestInfo?.guestName ?? ""}
                    invitationId={guestInfo?.invitationId ?? ""}
                />
            </Suspense>
        </GuestLayout>
    );
}
