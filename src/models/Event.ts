import mongoose, { Schema, Document } from "mongoose";

export enum CeremonyTypeEvent {
    VU_QUY = "vu_quy",
    THANH_HON = "thanh_hon",
    AN_HOI = "an_hoi",
    BAO_HY = "bao_hy",
    DAM_CUOI = "dam_cuoi",
    KHAC = "khac",
}

export interface IEvent extends Document {
    ownerId: mongoose.Types.ObjectId;
    name: string;
    ceremonyType: CeremonyTypeEvent;
    date: Date;
    locationName: string;
    addressDetail: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true },
        ceremonyType: {
            type: String,
            enum: Object.values(CeremonyTypeEvent),
            required: true,
        },
        date: { type: Date, required: true },
        locationName: { type: String, required: true },
        addressDetail: { type: String, required: true },
        notes: { type: String },
    },
    { timestamps: true }
);

EventSchema.index({ ownerId: 1, date: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
