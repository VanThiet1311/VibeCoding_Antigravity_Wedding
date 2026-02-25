import mongoose, { Schema, Document } from "mongoose";

export enum InvitedSide {
    NHA_TRAI = "nha_trai",
    NHA_GAI = "nha_gai",
}

export enum RSVPStatus {
    PENDING = "cho_xac_nhan",
    CONFIRMED = "tham_gia",
    DECLINED = "tu_choi",
}

export enum AttendanceStatus {
    INVITED = "invited",
    ARRIVED = "arrived",
    SEATED = "seated",
}

export interface IGuest extends Document {
    ownerId: mongoose.Types.ObjectId;
    ceremonyId: mongoose.Types.ObjectId;
    personId: mongoose.Types.ObjectId;
    invitedSide: InvitedSide;
    status: RSVPStatus;
    companionsCount: number;
    actualCompanions?: number; // Manual adjustments at check-in
    tableName?: string;
    invitationNameOverride?: string;
    invitedAt?: Date;
    note?: string;

    // Check-in / Reception Mode Fields
    attendanceStatus: AttendanceStatus;
    checkInTime?: Date;
    checkInDevice?: string;
    scanCount: number;

    createdAt: Date;
    updatedAt: Date;
}

const GuestSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        ceremonyId: { type: Schema.Types.ObjectId, ref: "Ceremony", required: true },
        personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
        invitedSide: { type: String, enum: Object.values(InvitedSide), required: true },
        status: { type: String, enum: Object.values(RSVPStatus), default: RSVPStatus.PENDING },
        companionsCount: { type: Number, default: 0 },
        actualCompanions: { type: Number },
        tableName: { type: String },
        invitationNameOverride: { type: String },
        invitedAt: { type: Date },
        note: { type: String },

        // Reception Mode fields
        attendanceStatus: { type: String, enum: Object.values(AttendanceStatus), default: AttendanceStatus.INVITED },
        checkInTime: { type: Date },
        checkInDevice: { type: String },
        scanCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Unique compound index so a person is only added ONCE per ceremony
GuestSchema.index({ ownerId: 1, ceremonyId: 1, personId: 1 }, { unique: true });

// Required performance indexes
GuestSchema.index({ ownerId: 1, ceremonyId: 1 });
GuestSchema.index({ ownerId: 1, personId: 1 });

export default mongoose.models.Guest || mongoose.model<IGuest>("Guest", GuestSchema);
