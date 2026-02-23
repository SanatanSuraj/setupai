/**
 * Seed script runnable with: node scripts/seed.mjs
 * Ensure MongoDB is running: mongod
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/setupai";

const OrganizationSchema = new mongoose.Schema({
  name: String,
  labType: String,
  city: String,
  state: String,
  budget: Number,
  subscriptionTier: { type: String, default: "pro" },
  createdAt: { type: Date, default: Date.now },
});
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  organizationId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});
const RoadmapSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId,
  tasks: [mongoose.Schema.Types.Mixed],
  progress: Number,
  estimatedCost: Number,
  timeline: { start: Date, end: Date },
  createdAt: { type: Date, default: Date.now },
});
const LicenseSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId,
  type: String,
  state: String,
  status: String,
  renewalDate: Date,
  documents: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
});
const VendorSchema = new mongoose.Schema({ name: String, contact: String, email: String, category: String });
const EquipmentSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId,
  name: String,
  category: String,
  capex: Number,
  maintenanceCost: Number,
  vendorId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});
const QCLogSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId,
  testName: String,
  value: Number,
  controlRange: { min: Number, max: Number },
  status: String,
  correctiveAction: String,
  createdAt: { type: Date, default: Date.now },
});

const Organization = mongoose.models?.Organization || mongoose.model("Organization", OrganizationSchema);
const User = mongoose.models?.User || mongoose.model("User", UserSchema);
const Roadmap = mongoose.models?.Roadmap || mongoose.model("Roadmap", RoadmapSchema);
const License = mongoose.models?.License || mongoose.model("License", LicenseSchema);
const Vendor = mongoose.models?.Vendor || mongoose.model("Vendor", VendorSchema);
const Equipment = mongoose.models?.Equipment || mongoose.model("Equipment", EquipmentSchema);
const QCLog = mongoose.models?.QCLog || mongoose.model("QCLog", QCLogSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No db");
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    await db.dropCollection(c.name);
  }

  const org = await Organization.create({
    name: "City Diagnostics",
    labType: "medium",
    city: "Mumbai",
    state: "Maharashtra",
    budget: 1500000,
    subscriptionTier: "pro",
  });

  const hashed = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin User",
    email: "admin@setupai.in",
    password: hashed,
    role: "admin",
    organizationId: org._id,
  });

  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 5);
  await Roadmap.create({
    organizationId: org._id,
    tasks: [
      { title: "Location finalization", status: "completed", module: "setup" },
      { title: "Rent agreement", status: "in_progress", module: "legal" },
      { title: "Layout planning", status: "pending", module: "infrastructure" },
      { title: "Equipment installation", status: "pending", module: "equipment" },
    ],
    progress: 25,
    estimatedCost: 1200000,
    timeline: { start, end },
  });

  await License.create({
    organizationId: org._id,
    type: "Clinical Establishment",
    state: "Maharashtra",
    status: "applied",
    renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    documents: [{ name: "Application.pdf", url: "/uploads/application.pdf", uploadedAt: new Date() }],
  });

  const vendor = await Vendor.create({ name: "Erba Mannheim", category: "Analyzers", email: "sales@erba.com" });
  await Equipment.create({
    organizationId: org._id,
    name: "Hematology Analyzer",
    category: "Hematology",
    capex: 450000,
    maintenanceCost: 5000,
    vendorId: vendor._id,
  });

  await QCLog.create({
    organizationId: org._id,
    testName: "Hb",
    value: 14.2,
    controlRange: { min: 12, max: 16 },
    status: "in_range",
  });
  await QCLog.create({
    organizationId: org._id,
    testName: "Hb",
    value: 11.1,
    controlRange: { min: 12, max: 16 },
    status: "out_of_range",
    correctiveAction: "Re-calibration scheduled",
  });

  console.log("Seed done. Admin login: admin@setupai.in / admin123");
  console.log("Organization ID:", org._id.toString());
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
