import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/http.js";

const caseTypes = ["Verification", "KYC", "Background Check", "Document Review", "Other"];

export function NewCasePage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clientName: "",
    subjectName: "",
    caseType: "Verification",
    dueDate: "",
    assignedAgent: ""
  });

  useEffect(() => {
    api.get("/users/agents").then(({ data }) => setAgents(data.agents));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/cases", { ...form, assignedAgent: form.assignedAgent || undefined });
      navigate(`/cases/${data.case._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create case");
    }
  }

  return (
    <Stack spacing={3} maxWidth={720}>
      <Button component={Link} to="/cases" sx={{ alignSelf: "flex-start" }}>Back</Button>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h5">Create Case</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Client name" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
          <TextField label="Subject name" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} required />
          <TextField select label="Case type" value={form.caseType} onChange={(e) => setForm({ ...form, caseType: e.target.value })}>
            {caseTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} required />
          <TextField select label="Assign agent" value={form.assignedAgent} onChange={(e) => setForm({ ...form, assignedAgent: e.target.value })}>
            <MenuItem value="">Leave as New</MenuItem>
            {agents.map((agent) => <MenuItem key={agent._id} value={agent._id}>{agent.name}</MenuItem>)}
          </TextField>
          <Button type="submit" variant="contained">Create case</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
