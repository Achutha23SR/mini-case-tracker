import express from "express";
import { User } from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/agents", authenticate, authorize("Manager"), async (req, res, next) => {
  try {
    const agents = await User.find({ role: "Agent", active: true }).select("name email role");
    res.json({ agents });
  } catch (err) {
    next(err);
  }
});

export default router;
