import { AppError } from "./errors.js";

const rules = {
  Manager: {
    New: ["Assigned"],
    Assigned: ["Assigned"],
    "In Progress": [],
    Submitted: ["Cleared", "Discrepant"],
    Cleared: [],
    Discrepant: []
  },
  Agent: {
    New: [],
    Assigned: ["In Progress"],
    "In Progress": ["Submitted"],
    Submitted: [],
    Cleared: [],
    Discrepant: []
  }
};

export function assertStatusTransition(user, item, toStatus) {
  const allowed = rules[user.role]?.[item.status] || [];
  if (!allowed.includes(toStatus)) {
    throw new AppError(`Cannot move case from ${item.status} to ${toStatus} as ${user.role}`, 400);
  }
}

export function assertAgentOwnsCase(user, item) {
  if (user.role !== "Agent") return;

  const assignedAgentId = item.assignedAgent?._id || item.assignedAgent;
  if (!assignedAgentId || assignedAgentId.toString() !== user._id.toString()) {
    throw new AppError("Agents can only access cases assigned to them", 403);
  }
}
