import express from "express";
import { z } from "zod";
import { Case, CASE_STATUSES, CASE_TYPES } from "../models/Case.js";
import { User } from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../utils/errors.js";
import { assertAgentOwnsCase, assertStatusTransition } from "../utils/statusRules.js";

const router = express.Router();

const createCaseSchema = z.object({
  clientName: z.string().min(2).max(120),
  subjectName: z.string().min(2).max(120),
  caseType: z.enum(CASE_TYPES),
  dueDate: z.coerce.date(),
  assignedAgent: z.string().optional().nullable()
});

const updateStatusSchema = z.object({
  status: z.enum(CASE_STATUSES),
  note: z.string().max(500).optional()
});

const assignSchema = z.object({
  assignedAgent: z.string().min(1)
});

const commentSchema = z.object({
  body: z.string().min(1).max(2000)
});

const listQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(CASE_STATUSES).optional(),
  agent: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

const populateCase = [
  { path: "assignedAgent", select: "name email role" },
  { path: "createdBy", select: "name email role" },
  { path: "comments.author", select: "name email role" },
  { path: "documents.uploadedBy", select: "name email role" },
  { path: "auditLog.actor", select: "name email role" }
];

function scopedCaseQuery(user) {
  return user.role === "Agent" ? { assignedAgent: user._id } : {};
}

router.get("/", authenticate, validate(listQuerySchema, "query"), async (req, res, next) => {
  try {
    const { search, status, agent, page, limit } = req.query;
    const query = scopedCaseQuery(req.user);

    if (status) query.status = status;
    if (req.user.role === "Manager" && agent) query.assignedAgent = agent;
    if (search) {
      query.$or = [
        { clientName: new RegExp(search, "i") },
        { subjectName: new RegExp(search, "i") },
        { caseType: new RegExp(search, "i") }
      ];
    }

    const skip = (page - 1) * limit;
    const [cases, total] = await Promise.all([
      Case.find(query)
        .populate("assignedAgent", "name email role")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Case.countDocuments(query)
    ]);

    res.json({ cases, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
});

router.get("/stats", authenticate, async (req, res, next) => {
  try {
    const query = scopedCaseQuery(req.user);
    const [byStatus, overdue] = await Promise.all([
      Case.aggregate([
        { $match: query },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Case.countDocuments({
        ...query,
        dueDate: { $lt: new Date() },
        status: { $nin: ["Cleared", "Discrepant"] }
      })
    ]);

    const stats = Object.fromEntries(CASE_STATUSES.map((status) => [status, 0]));
    byStatus.forEach((item) => {
      stats[item._id] = item.count;
    });

    res.json({ stats, overdue });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, authorize("Manager"), validate(createCaseSchema), async (req, res, next) => {
  try {
    let status = "New";
    let assignedAgent = req.body.assignedAgent || undefined;

    if (assignedAgent) {
      const agent = await User.findOne({ _id: assignedAgent, role: "Agent", active: true });
      if (!agent) throw new AppError("Assigned agent not found", 400);
      status = "Assigned";
    }

    const item = await Case.create({
      ...req.body,
      assignedAgent,
      status,
      createdBy: req.user._id,
      auditLog: [{ fromStatus: undefined, toStatus: status, actor: req.user._id, note: "Case created" }]
    });

    await item.populate(populateCase);
    res.status(201).json({ case: item });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const item = await Case.findById(req.params.id).populate(populateCase);
    if (!item) throw new AppError("Case not found", 404);
    assertAgentOwnsCase(req.user, item);
    res.json({ case: item });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/assign", authenticate, authorize("Manager"), validate(assignSchema), async (req, res, next) => {
  try {
    const agent = await User.findOne({ _id: req.body.assignedAgent, role: "Agent", active: true });
    if (!agent) throw new AppError("Assigned agent not found", 400);

    const item = await Case.findById(req.params.id);
    if (!item) throw new AppError("Case not found", 404);
    if (["Cleared", "Discrepant"].includes(item.status)) {
      throw new AppError("Closed cases cannot be reassigned", 400);
    }

    const fromStatus = item.status;
    item.assignedAgent = agent._id;
    if (item.status === "New") {
      item.status = "Assigned";
      item.auditLog.push({ fromStatus, toStatus: "Assigned", actor: req.user._id, note: "Assigned to agent" });
    }

    await item.save();
    await item.populate(populateCase);
    res.json({ case: item });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", authenticate, validate(updateStatusSchema), async (req, res, next) => {
  try {
    const item = await Case.findById(req.params.id);
    if (!item) throw new AppError("Case not found", 404);
    assertAgentOwnsCase(req.user, item);
    assertStatusTransition(req.user, item, req.body.status);

    const fromStatus = item.status;
    item.status = req.body.status;
    item.auditLog.push({ fromStatus, toStatus: req.body.status, actor: req.user._id, note: req.body.note });
    await item.save();
    await item.populate(populateCase);
    res.json({ case: item });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/comments", authenticate, validate(commentSchema), async (req, res, next) => {
  try {
    const item = await Case.findById(req.params.id);
    if (!item) throw new AppError("Case not found", 404);
    assertAgentOwnsCase(req.user, item);

    item.comments.push({ body: req.body.body, author: req.user._id });
    await item.save();
    await item.populate(populateCase);
    res.status(201).json({ case: item });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/documents", authenticate, upload.single("file"), async (req, res, next) => {
  try {
    const item = await Case.findById(req.params.id);
    if (!item) throw new AppError("Case not found", 404);
    assertAgentOwnsCase(req.user, item);
    if (!req.file) throw new AppError("File is required", 400);
    if (req.user.role === "Agent" && !["Assigned", "In Progress"].includes(item.status)) {
      throw new AppError("Agents can upload only before submission", 400);
    }

    item.documents.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id
    });
    await item.save();
    await item.populate(populateCase);
    res.status(201).json({ case: item });
  } catch (err) {
    next(err);
  }
});

export default router;
