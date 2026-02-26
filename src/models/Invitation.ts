import mongoose, { Schema, Document } from "mongoose";

export enum EventTypeAlbum {
    DAM_CUOI = "dam_cuoi",
    DAM_HOI = "dam_hoi",
    SINH_NHAT = "sinh_nhat",
    TAN_GIA = "tan_gia",
    THOI_NOI = "thoi_noi",
    KHAC = "khac",
}

export enum GiftTypeAlbum {
    TIEN_MAT = "tien_mat",
    VANG = "vang",
    QUA_TANG = "qua_tang",
    KHONG_CO = "khong_co",
}

// Album for tracking invitations received from others
export interface IInvitationAlbum extends Document {
    ownerId: mongoose.Types.ObjectId;
    personId: mongoose.Types.ObjectId; // Who invited you
    eventType: EventTypeAlbum;
    eventDate: Date;
    location?: string;
    giftAmount?: number;
    currency: string; // e.g., "VND", "USD"
    giftType: GiftTypeAlbum;
    attended: boolean;
    returnGiftPlanned: boolean; // Need to return gift later
    images: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvitationAlbumSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
        eventType: { type: String, enum: Object.values(EventTypeAlbum), required: true },
        eventDate: { type: Date, required: true },
        location: { type: String },
        giftAmount: { type: Number, default: 0 },
        currency: { type: String, default: "VND" },
        giftType: { type: String, enum: Object.values(GiftTypeAlbum), default: GiftTypeAlbum.KHONG_CO },
        attended: { type: Boolean, default: false },
        returnGiftPlanned: { type: Boolean, default: false },
        images: [{ type: String }],
        notes: { type: String },
    },
    { timestamps: true }
);

InvitationAlbumSchema.index({ ownerId: 1, eventDate: -1 });

export default mongoose.models.Invitation || mongoose.model<IInvitationAlbum>("Invitation", InvitationAlbumSchema);
