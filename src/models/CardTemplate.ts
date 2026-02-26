import mongoose, { Schema, Document } from "mongoose";

export interface ICardTemplate extends Document {
    ownerId: mongoose.Types.ObjectId;
    name: string;
    category: string; // e.g., "Vu Quy", "Thanh Hon", "Invitation"
    htmlContent: string;
    cssContent: string;
    isPublic: boolean; // Pre-made templates can be public
}

const CardTemplateSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true },
        category: { type: String, default: "Wedding" },
        htmlContent: { type: String, required: true },
        cssContent: { type: String },
        isPublic: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.CardTemplate ||
    mongoose.model<ICardTemplate>("CardTemplate", CardTemplateSchema);
