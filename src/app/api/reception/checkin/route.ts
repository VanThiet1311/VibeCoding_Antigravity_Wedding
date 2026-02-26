import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Guest, { AttendanceStatus } from "@/models/Guest";
import { validateQRToken } from "@/lib/qr-token";

export type CheckInResponseShape = "accepted" | "duplicate" | "conflict" | "wrong_ceremony" | "invalid";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, deviceId, actualCompanions, guestId: directGuestId, ceremonyId: directCeremonyId } = body;

        let finalGuestId = directGuestId;
        let finalCeremonyId = directCeremonyId;

        // 1. Identification: Either via Token (Staff scan) or Direct ID (Guest self-scan)
        if (token) {
            const payload = validateQRToken(token);
            if (!payload) {
                return NextResponse.json({ status: "invalid" }, { status: 400 });
            }
            finalGuestId = payload.guestId;
            finalCeremonyId = payload.ceremonyId;
        }

        if (!finalGuestId || !finalCeremonyId) {
            return NextResponse.json({ status: "invalid", message: "Missing guest or ceremony identity" }, { status: 400 });
        }

        await dbConnect();

        // 2. Fetch the Guest record
        const guest = await Guest.findById(finalGuestId);

        if (!guest) {
            return NextResponse.json({ status: "invalid", message: "Guest not found" }, { status: 404 });
        }

        // 3. Verify it belongs to the exact ceremony
        if (guest.ceremonyId.toString() !== finalCeremonyId) {
            return NextResponse.json({ status: "wrong_ceremony" }, { status: 400 });
        }

        // 4. Seat Count & Duplicate Validation
        if (guest.checkedInCount >= guest.allowedSeats) {
            return NextResponse.json({
                status: "FULL",
                message: "Đã đủ số người",
                guest
            }, { status: 200 });
        }

        const isReplicaScan = guest.attendanceStatus === AttendanceStatus.ARRIVED && guest.checkInDevice === deviceId;
        if (isReplicaScan) {
            // If we really want "already checked in" vs "full"
            // But the rules say if count >= seats -> FULL.
            // Let's check if the specific device just scanned again.
            return NextResponse.json({ status: "ALREADY_CHECKED_IN", guest }, { status: 200 });
        }

        // 5. Apply the official Check-in Transition
        const isFirst = guest.checkedInCount === 0;

        guest.attendanceStatus = AttendanceStatus.ARRIVED;
        guest.checkedInCount = (guest.checkedInCount || 0) + 1;

        if (isFirst) {
            guest.checkedInAt = new Date();
            guest.checkInTime = guest.checkedInAt; // Support legacy field
        }

        guest.checkInDevice = deviceId || "unknown";
        guest.scanCount = (guest.scanCount || 0) + 1;

        if (actualCompanions !== undefined) {
            guest.actualCompanions = actualCompanions;
        }

        await guest.save();

        return NextResponse.json({
            status: isFirst ? "FIRST_CHECKIN" : "ADDITIONAL_CHECKIN",
            guest
        }, { status: 200 });

    } catch (error) {
        console.error("Check-in Error:", error);
        return NextResponse.json({ status: "invalid" }, { status: 500 });
    }
}
