import mongoose, { Schema, Document } from "mongoose";

export enum GuestListSide {
    NHA_TRAI = "nha_trai",
    NHA_GAI = "nha_gai",
}

export enum GuestListStatus {
    PENDING = "pending",
    INVITED = "invited",
    CONFIRMED = "confirmed",
    DECLINED = "declined",
}

export interface IGuestList extends Document {
    ownerId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    personId: mongoose.Types.ObjectId;
    invitedSide: GuestListSide;
    status: GuestListStatus;
    tableName?: string;
    companionsCount: number;
    notes?: string;
    qrToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const GuestListSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
        invitedSide: { type: String, enum: Object.values(GuestListSide), required: true },
        status: { type: String, enum: Object.values(GuestListStatus), default: GuestListStatus.PENDING },
        tableName: { type: String },
        companionsCount: { type: Number, default: 0 },
        notes: { type: String },
        qrToken: { type: String },
    },
    { timestamps: true }
);

// One person per event per owner
GuestListSchema.index({ ownerId: 1, eventId: 1, personId: 1 }, { unique: true });
GuestListSchema.index({ ownerId: 1, eventId: 1 });
GuestListSchema.index({ ownerId: 1, personId: 1 });

export default mongoose.models.GuestList || mongoose.model<IGuestList>("GuestList", GuestListSchema);
