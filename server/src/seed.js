import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import { Case } from "./models/Case.js";
import { User } from "./models/User.js";

dotenv.config();

const password = "Password123!";

async function seed() {
  await connectDb();
  await Promise.all([User.deleteMany({}), Case.deleteMany({})]);

  const [manager, ava, noah] = await User.create([
    { name: "Maya Manager", email: "manager@example.com", password, role: "Manager" },
    { name: "Ava Agent", email: "agent.ava@example.com", password, role: "Agent" },
    { name: "Noah Agent", email: "agent.noah@example.com", password, role: "Agent" }
  ]);

  await Case.create([
    {
      clientName: "Acme Lending",
      subjectName: "Jordan Lee",
      caseType: "KYC",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: "Assigned",
      assignedAgent: ava._id,
      createdBy: manager._id,
      comments: [{ body: "Please verify the address proof and PAN copy.", author: manager._id }],
      auditLog: [
        { toStatus: "Assigned", actor: manager._id, note: "Case created and assigned" }
      ]
    },
    {
      clientName: "Northstar Bank",
      subjectName: "Priya Shah",
      caseType: "Background Check",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "In Progress",
      assignedAgent: noah._id,
      createdBy: manager._id,
      comments: [{ body: "Employment records requested from HR.", author: noah._id }],
      auditLog: [
        { toStatus: "Assigned", actor: manager._id, note: "Case created and assigned" },
        { fromStatus: "Assigned", toStatus: "In Progress", actor: noah._id, note: "Started verification" }
      ]
    },
    {
      clientName: "BluePeak Insurance",
      subjectName: "Morgan Kim",
      caseType: "Document Review",
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "Submitted",
      assignedAgent: ava._id,
      createdBy: manager._id,
      comments: [{ body: "All documents uploaded. Ready for review.", author: ava._id }],
      auditLog: [
        { toStatus: "Assigned", actor: manager._id, note: "Case created and assigned" },
        { fromStatus: "Assigned", toStatus: "In Progress", actor: ava._id, note: "Started review" },
        { fromStatus: "In Progress", toStatus: "Submitted", actor: ava._id, note: "Submitted to manager" }
      ]
    }
  ]);

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
