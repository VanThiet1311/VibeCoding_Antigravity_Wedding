import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Wedding, { WeddingStatus } from "@/models/Wedding";
import Ceremony from "@/models/Ceremony";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();

        // 1. Find or create a demo user
        let user = await User.findOne({ email: "admin@example.com" });
        if (!user) {
            user = await User.create({
                name: "Admin",
                email: "admin@example.com",
                password: "password123",
                role: "admin"
            });
        }

        // 2. Create/Update a demo wedding
        const weddingSlug = "demo-wedding";
        let wedding = await Wedding.findOneAndUpdate(
            { slug: weddingSlug },
            {
                ownerId: user._id,
                slug: weddingSlug,
                brideName: "Linh",
                groomName: "Tuấn",
                weddingDate: new Date("2026-06-20"),
                status: WeddingStatus.CHUAN_BI
            },
            { new: true, upsert: true }
        );

        // 3. Create Demo Ceremonies
        const ceremonies = [
            {
                weddingId: wedding._id,
                name: "Lễ Thành Hôn",
                date: new Date("2026-06-20"),
                startTime: "09:00",
                locationName: "Trung tâm Hội nghị White Palace",
                addressDetail: "108 Phạm Văn Đồng, Hiệp Bình Chánh, Thủ Đức, TP. HCM",
            },
            {
                weddingId: wedding._id,
                name: "Tiệc Tối Chúc Mừng",
                date: new Date("2026-06-20"),
                startTime: "18:00",
                locationName: "Trung tâm Hội nghị White Palace - Sảnh Grand Ball",
                addressDetail: "108 Phạm Văn Đồng, Hiệp Bình Chánh, Thủ Đức, TP. HCM",
            }
        ];

        // Clear old ceremonies and add new ones
        await Ceremony.deleteMany({ weddingId: wedding._id });
        await Ceremony.insertMany(ceremonies);

        return NextResponse.json({ 
            message: "Demo wedding and ceremonies seeded successfully!", 
            wedding,
            ceremoniesCount: ceremonies.length
        });
    } catch (error) {
        console.error("Seeding Error:", error);
        return NextResponse.json({ message: "Seeding failed", error: String(error) }, { status: 500 });
    }
}
