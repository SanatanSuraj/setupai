import mongoose, { Schema, Model } from "mongoose";
import type { IStaff } from "@/types";

const StaffSchema = new Schema<IStaff>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    role: { type: String, required: true },
    qualification: { type: String },
    salaryBenchmark: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Staff: Model<IStaff> = mongoose.models.Staff ?? mongoose.model<IStaff>("Staff", StaffSchema);
