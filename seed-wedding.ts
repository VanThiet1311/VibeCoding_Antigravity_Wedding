import dbConnect from "./src/lib/db";
import Wedding, { WeddingStatus } from "./src/models/Wedding";
import User from "./src/models/User";
import mongoose from "mongoose";

async function seed() {
    await dbConnect();

    // Find or create a demo user
    let user = await User.findOne({ email: "admin@example.com" });
    if (!user) {
        user = await User.create({
            name: "Admin",
            email: "admin@example.com",
            password: "password123", // In a real app, this would be hashed
            role: "admin"
        });
    }

    // Create a demo wedding
    const demoWedding = {
        ownerId: user._id,
        slug: "demo-wedding",
        brideName: "Linh",
        groomName: "Tuấn",
        weddingDate: new Date("2026-06-20"),
        status: WeddingStatus.CHUAN_BI
    };

    await Wedding.findOneAndUpdate(
        { slug: "demo-wedding" },
        demoWedding,
        { upsate: true, new: true, upsert: true }
    );

    console.log("Demo wedding seeded successfully!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
