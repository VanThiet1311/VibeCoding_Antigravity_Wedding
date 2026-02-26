import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SupportMessage from "@/models/SupportMessage";
import { requireStaff } from "@/lib/rbac";

/**
 * GET /api/support/sessions
 * List active guest conversations for staff dashboard.
 */
export async function GET() {
    try {
        await requireStaff();
        await dbConnect();

        // Aggregate last messages per guestId to show conversation list
        const sessions = await SupportMessage.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$guestId",
                    lastMessage: { $first: "$content" },
                    lastSender: { $first: "$sender" },
                    unreadCount: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$sender", "guest"] }, { $eq: ["$isRead", false] }] }, 1, 0] }
                    },
                    timestamp: { $first: "$createdAt" },
                    weddingId: { $first: "$weddingId" },
                }
            },
            { $sort: { timestamp: -1 } },
            {
                $lookup: {
                    from: "guests",
                    localField: "_id",
                    foreignField: "_id",
                    as: "guestInfo"
                }
            },
            { $unwind: "$guestInfo" },
            {
                $lookup: {
                    from: "people",
                    localField: "guestInfo.personId",
                    foreignField: "_id",
                    as: "personInfo"
                }
            },
            { $unwind: "$personInfo" }
        ]);

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("GET Support Sessions Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
