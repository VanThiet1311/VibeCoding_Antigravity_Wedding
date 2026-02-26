import mongoose, { Schema, Document } from "mongoose";
import { removeAccents } from "@/lib/diacritics";

export enum FamilyGroup {
    GIA_DINH = "gia_dinh",
    BAN_BE = "ban_be",
    DONG_NGHIEP = "dong_nghiep",
    HO_HANG = "ho_hang",
    KHAC = "khac",
}

export enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
}

export interface IPerson extends Document {
    ownerId: mongoose.Types.ObjectId;
    fullName: string;
    fullNameNormalized: string;
    displayName: string;
    phone?: string;
    address?: string;
    familyGroup: FamilyGroup;
    gender: Gender;
    isDeceased: boolean;
    notes?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PersonSchema = new Schema<IPerson>(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        fullName: { type: String, required: true },
        fullNameNormalized: { type: String, required: true, index: true },
        displayName: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        familyGroup: {
            type: String,
            enum: Object.values(FamilyGroup),
            default: FamilyGroup.KHAC,
        },
        gender: {
            type: String,
            enum: Object.values(Gender),
            default: Gender.OTHER,
        },
        isDeceased: { type: Boolean, default: false },
        notes: { type: String },
        avatar: { type: String },
    },
    { timestamps: true }
);

PersonSchema.pre("save", function (this: IPerson) {
    if (this.isModified("fullName") || this.isNew) {
        this.fullNameNormalized = removeAccents(this.fullName);
    }
});

// Required Index
PersonSchema.index({ ownerId: 1, fullName: 1 });
PersonSchema.index({ ownerId: 1, familyGroup: 1 });

export default mongoose.models.Person || mongoose.model<IPerson>("Person", PersonSchema);
