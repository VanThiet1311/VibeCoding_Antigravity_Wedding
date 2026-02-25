import mongoose, { Schema, Document } from "mongoose";

export enum CeremonyType {
    VU_QUY = "vu_quy",
    THANH_HON = "thanh_hon",
    AN_HOI = "an_hoi",
    BAO_HY = "bao_hy",
    KHAC = "khac",
}

export enum HostSide {
    NHA_TRAI = "nha_trai",
    NHA_GAI = "nha_gai",
    CHUNG = "chung",
}

export interface ICeremony extends Document {
    ownerId: mongoose.Types.ObjectId;
    weddingId: mongoose.Types.ObjectId;
    name: string;
    ceremonyType: CeremonyType;
    hostSide: HostSide;
    date: Date;
    startTime?: string;
    endTime?: string;
    locationName: string;
    addressDetail: string;
    mapUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CeremonySchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true, index: true },
        name: { type: String, required: true },
        ceremonyType: { type: String, enum: Object.values(CeremonyType), required: true },
        hostSide: { type: String, enum: Object.values(HostSide), required: true },
        date: { type: Date, required: true },
        startTime: { type: String },
        endTime: { type: String },
        locationName: { type: String, required: true },
        addressDetail: { type: String, required: true },
        mapUrl: { type: String },
    },
    { timestamps: true }
);

// Required Index
CeremonySchema.index({ ownerId: 1, date: 1 });

export default mongoose.models.Ceremony || mongoose.model<ICeremony>("Ceremony", CeremonySchema);
