import mongoose, { Schema, Document } from "mongoose";

export enum WeddingStatus {
    CHUAN_BI = "chuan_bi",
    DA_HOAN_THANH = "da_hoan_thanh",
}

export interface IWedding extends Document {
    ownerId: mongoose.Types.ObjectId;
    brideName: string;
    groomName: string;
    weddingDate: Date;
    status: WeddingStatus;
    createdAt: Date;
    updatedAt: Date;
}

const WeddingSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        brideName: { type: String, required: true },
        groomName: { type: String, required: true },
        weddingDate: { type: Date, required: true },
        status: { type: String, enum: Object.values(WeddingStatus), default: WeddingStatus.CHUAN_BI },
    },
    { timestamps: true }
);

export default mongoose.models.Wedding || mongoose.model<IWedding>("Wedding", WeddingSchema);
