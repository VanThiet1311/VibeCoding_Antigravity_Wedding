import mongoose, { Schema, Document } from "mongoose";

export enum RelType {
    BO_ME = "bo_me",
    CON_CAI = "con_cai",
    ANH_CHI_EM = "anh_chi_em",
    HO_HANG = "ho_hang",
    BAN_BE = "ban_be",
    DONG_NGHIEP = "dong_nghiep",
    GIA_DINH_CHONG_VO = "gia_dinh_chong_vo",
}

export interface IRelationship extends Document {
    ownerId: mongoose.Types.ObjectId;
    fromPersonId: mongoose.Types.ObjectId;
    toPersonId: mongoose.Types.ObjectId;
    type: RelType;
    createdAt: Date;
    updatedAt: Date;
}

const RelationshipSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        fromPersonId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
        toPersonId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
        type: { type: String, enum: Object.values(RelType), required: true },
    },
    { timestamps: true }
);

// Unique directional bond
RelationshipSchema.index({ ownerId: 1, fromPersonId: 1, toPersonId: 1, type: 1 }, { unique: true });

// Performance indexes
RelationshipSchema.index({ ownerId: 1, fromPersonId: 1 });
RelationshipSchema.index({ ownerId: 1, toPersonId: 1 });

export default mongoose.models.Relationship ||
    mongoose.model<IRelationship>("Relationship", RelationshipSchema);
