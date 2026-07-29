import { Chip } from "@mui/material";

const colors = {
  New: "default",
  Assigned: "info",
  "In Progress": "warning",
  Submitted: "secondary",
  Cleared: "success",
  Discrepant: "error"
};

export function StatusChip({ status }) {
  return <Chip label={status} color={colors[status] || "default"} size="small" />;
}
