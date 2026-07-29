import mongoose from "mongoose";

export const CASE_STATUSES = ["New", "Assigned", "In Progress", "Submitted", "Cleared", "Discrepant"];
export const CASE_TYPES = ["Verification", "KYC", "Background Check", "Document Review", "Other"];

const documentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const auditLogSchema = new mongoose.Schema(
  {
    fromStatus: { type: String, enum: CASE_STATUSES },
    toStatus: { type: String, enum: CASE_STATUSES, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, trim: true }
  },
  { timestamps: true }
);

const caseSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    subjectName: { type: String, required: true, trim: true },
    caseType: { type: String, enum: CASE_TYPES, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: CASE_STATUSES, default: "New", index: true },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    documents: [documentSchema],
    comments: [commentSchema],
    auditLog: [auditLogSchema]
  },
  { timestamps: true }
);

caseSchema.index({ clientName: "text", subjectName: "text", caseType: "text" });

export const Case = mongoose.model("Case", caseSchema);
