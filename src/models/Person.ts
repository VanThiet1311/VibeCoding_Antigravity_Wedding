import mongoose, { Schema, Document } from "mongoose";

export enum FamilyGroup {
    GIA_DINH = "gia_dinh",
    BAN_BE = "ban_be",
    DONG_NGHIEP = "dong_nghiep",
    HO_HANG = "ho_hang",
    KHAC = "khac",
}

export interface IPerson extends Document {
    ownerId: mongoose.Types.ObjectId;
    fullName: string;
    displayName: string;
    phone?: string;
    address?: string;
    familyGroup: FamilyGroup;
    notes?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PersonSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        fullName: { type: String, required: true },
        displayName: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        familyGroup: {
            type: String,
            enum: Object.values(FamilyGroup),
            default: FamilyGroup.KHAC,
        },
        notes: { type: String },
        avatar: { type: String },
    },
    { timestamps: true }
);

// Required Index
PersonSchema.index({ ownerId: 1, fullName: 1 });

export default mongoose.models.Person || mongoose.model<IPerson>("Person", PersonSchema);
