import { Alert, Box, Button, Divider, Grid, Link as MuiLink, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/http.js";
import { StatusChip } from "../components/StatusChip.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const managerTransitions = {
  Submitted: ["Cleared", "Discrepant"]
};

const agentTransitions = {
  Assigned: ["In Progress"],
  "In Progress": ["Submitted"]
};

export function CaseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCase();
  }, [id]);

  async function loadCase() {
    setError("");
    try {
      const { data } = await api.get(`/cases/${id}`);
      setItem(data.case);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load case");
    }
  }

  const transitions = useMemo(() => {
    if (!item) return [];
    return user?.role === "Manager" ? managerTransitions[item.status] || [] : agentTransitions[item.status] || [];
  }, [item, user]);

  async function refreshFrom(action) {
    setError("");
    try {
      const updated = await action();
      setItem(updated);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  }

  async function addComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    await refreshFrom(async () => {
      const { data } = await api.post(`/cases/${id}/comments`, { body: comment });
      setComment("");
      return data.case;
    });
  }

  async function uploadFile(event) {
    event.preventDefault();
    if (!file) return;
    await refreshFrom(async () => {
      const body = new FormData();
      body.append("file", file);
      const { data } = await api.post(`/cases/${id}/documents`, body);
      setFile(null);
      return data.case;
    });
  }

  async function updateStatus(event) {
    event.preventDefault();
    if (!status) return;
    await refreshFrom(async () => {
      const { data } = await api.patch(`/cases/${id}/status`, { status, note });
      setStatus("");
      setNote("");
      return data.case;
    });
  }

  if (!item) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/cases" sx={{ alignSelf: "flex-start" }}>Back</Button>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading case...</Typography>}
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button component={Link} to="/cases" sx={{ alignSelf: "flex-start" }}>Back</Button>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4">{item.subjectName}</Typography>
            <Typography color="text.secondary">{item.clientName} · {item.caseType}</Typography>
          </Box>
          <StatusChip status={item.status} />
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">Due Date</Typography>
            <Typography>{format(new Date(item.dueDate), "dd MMM yyyy")}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">Assigned Agent</Typography>
            <Typography>{item.assignedAgent?.name || "Unassigned"}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">Created By</Typography>
            <Typography>{item.createdBy?.name}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">Documents</Typography>
            <Typography>{item.documents.length}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {transitions.length > 0 && (
        <Paper component="form" onSubmit={updateStatus} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Move Status</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField select label="Next status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220 }}>
                {transitions.map((next) => <MenuItem key={next} value={next}>{next}</MenuItem>)}
              </TextField>
              <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
              <Button type="submit" variant="contained">Update</Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Comments</Typography>
              <Stack component="form" onSubmit={addComment} direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Add note" value={comment} onChange={(e) => setComment(e.target.value)} fullWidth />
                <Button type="submit" variant="contained">Add</Button>
              </Stack>
              <Divider />
              {item.comments.map((entry) => (
                <Box key={entry._id}>
                  <Typography>{entry.body}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.author?.name} · {format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm")}
                  </Typography>
                </Box>
              ))}
              {!item.comments.length && <Typography color="text.secondary">No comments yet.</Typography>}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Documents</Typography>
              <Stack component="form" onSubmit={uploadFile} spacing={2}>
                <Button component="label" variant="outlined">
                  Choose file
                  <input hidden type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </Button>
                {file && <Typography variant="body2">{file.name}</Typography>}
                <Button type="submit" variant="contained" disabled={!file}>Upload</Button>
              </Stack>
              <Divider />
              {item.documents.map((doc) => (
                <Box key={doc._id}>
                  <MuiLink href={`${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}${doc.path}`} target="_blank" rel="noreferrer">
                    {doc.originalName}
                  </MuiLink>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Uploaded by {doc.uploadedBy?.name} · {Math.round(doc.size / 1024)} KB
                  </Typography>
                </Box>
              ))}
              {!item.documents.length && <Typography color="text.secondary">No documents uploaded.</Typography>}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Status Timeline</Typography>
        <Stack spacing={2}>
          {item.auditLog.map((entry) => (
            <Box key={entry._id} sx={{ borderLeft: "3px solid", borderColor: "primary.main", pl: 2 }}>
              <Typography>
                {entry.fromStatus ? `${entry.fromStatus} -> ${entry.toStatus}` : entry.toStatus}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {entry.actor?.name} · {format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm")}
              </Typography>
              {entry.note && <Typography variant="body2">{entry.note}</Typography>}
            </Box>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
