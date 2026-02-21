import { Types } from "mongoose";

export type UserRole = "admin" | "compliance_manager" | "lab_manager" | "viewer";
export type SubscriptionTier = "free" | "pro" | "enterprise";
export type LabType = "basic" | "medium" | "advanced" | "clinic_lab";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type LicenseStatus = "pending" | "applied" | "approved" | "rejected";
export type SampleOrderStatus = "collected" | "testing" | "qc" | "report_generated" | "delivered";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organizationId: Types.ObjectId;
  createdAt: Date;
}

export interface IOrganization {
  _id: Types.ObjectId;
  name: string;
  labType: LabType;
  city: string;
  state?: string;
  budget?: number;
  subscriptionTier: SubscriptionTier;
  createdAt?: Date;
}

export interface ITask {
  _id?: Types.ObjectId;
  title: string;
  status: TaskStatus;
  dependency?: string;
  dueDate?: Date;
  module: string;
}

export interface IRoadmap {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  tasks: ITask[];
  progress: number;
  estimatedCost: number;
  timeline: { start: Date; end: Date };
  createdAt?: Date;
}

export interface ILicense {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  type: string;
  state: string;
  status: LicenseStatus;
  renewalDate?: Date;
  documents: { name: string; url: string; uploadedAt: Date }[];
  createdAt?: Date;
}

export interface IVendor {
  _id: Types.ObjectId;
  name: string;
  contact?: string;
  email?: string;
  category?: string;
}

export interface IEquipment {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  name: string;
  category: string;
  capex: number;
  maintenanceCost?: number;
  vendorId?: Types.ObjectId;
  createdAt?: Date;
}

export interface IStaff {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  role: string;
  qualification?: string;
  salaryBenchmark?: number;
  createdAt?: Date;
}

export interface ISOP {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  title: string;
  content: string;
  module: string;
  createdAt?: Date;
}

export interface IQCLog {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  testName: string;
  value: number;
  controlRange: { min: number; max: number };
  status: "in_range" | "out_of_range";
  correctiveAction?: string;
  createdAt?: Date;
}

export interface IFinancialModel {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  capex: number;
  opex: number;
  revenueProjection: number[];
  breakEvenMonths: number;
  createdAt?: Date;
}

export interface ISampleOrder {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  patientName: string;
  testType: string;
  status: SampleOrderStatus;
  TAT?: number; // hours
  collectedAt?: Date;
  createdAt?: Date;
}
