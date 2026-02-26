import mongoose, { Schema, Document } from "mongoose";

export interface ISupportMessage extends Document {
    guestId: mongoose.Types.ObjectId;
    weddingId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId; // Owner of the wedding
    sender: "guest" | "staff";
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SupportMessageSchema: Schema = new Schema(
    {
        guestId: { type: Schema.Types.ObjectId, ref: "Guest", required: true, index: true },
        weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true, index: true },
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        sender: { type: String, enum: ["guest", "staff"], required: true },
        content: { type: String, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for fast polling and conversation sorting
SupportMessageSchema.index({ guestId: 1, createdAt: -1 });

export default mongoose.models.SupportMessage || mongoose.model<ISupportMessage>("SupportMessage", SupportMessageSchema);
