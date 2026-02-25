import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Guest, { AttendanceStatus } from "@/models/Guest";
import { validateQRToken } from "@/lib/qr-token";

export type CheckInResponseShape = "accepted" | "duplicate" | "conflict" | "wrong_ceremony" | "invalid";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, deviceId, actualCompanions, scanTime } = body;

        if (!token) {
            return NextResponse.json({ status: "invalid" }, { status: 400 });
        }

        // 1. Verify Signature (Server re-verification)
        const payload = validateQRToken(token);
        if (!payload) {
            return NextResponse.json({ status: "invalid" }, { status: 400 });
        }

        await dbConnect();

        // 2. Fetch the Guest record
        const guest = await Guest.findById(payload.gid);

        if (!guest) {
            return NextResponse.json({ status: "invalid" }, { status: 404 });
        }

        // 3. Verify it belongs to the exact ceremony
        if (guest.ceremonyId.toString() !== payload.cid) {
            return NextResponse.json({ status: "wrong_ceremony" }, { status: 400 });
        }

        // 4. State Machine Transition checking
        if (guest.attendanceStatus === AttendanceStatus.ARRIVED || guest.attendanceStatus === AttendanceStatus.SEATED) {
            // Check for multi-device conflict (Race condition)
            // If the server scan count is > 0, and this request comes with a significantly newer scanTime,
            // or the device IDs differ significantly, we consider it a duplicate or conflict.
            // For general duplicate scanning on the same device:
            if (guest.checkInDevice === deviceId) {
                return NextResponse.json({ status: "duplicate", guest }, { status: 200 });
            } else {
                return NextResponse.json({ status: "conflict", guest }, { status: 200 });
            }
        }

        // 5. Apply the official Check-in Transition
        const finalCompanions = actualCompanions !== undefined ? actualCompanions : guest.companionsCount;

        guest.attendanceStatus = AttendanceStatus.ARRIVED;
        guest.checkInTime = scanTime ? new Date(scanTime) : new Date();
        guest.checkInDevice = deviceId || "unknown";
        guest.scanCount = (guest.scanCount || 0) + 1;
        guest.actualCompanions = finalCompanions;

        await guest.save();

        return NextResponse.json({ status: "accepted", guest }, { status: 200 });

    } catch (error) {
        console.error("Check-in Error:", error);
        return NextResponse.json({ status: "invalid" }, { status: 500 });
    }
}
