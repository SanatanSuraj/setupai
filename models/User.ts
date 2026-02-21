import mongoose, { Schema, Model } from "mongoose";
import type { IUser, UserRole } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "compliance_manager", "lab_manager", "viewer"] as UserRole[], default: "viewer" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
