import { Box, Button, Card, CardContent, Grid, IconButton, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/http.js";
import { StatusChip } from "../components/StatusChip.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const statuses = ["", "New", "Assigned", "In Progress", "Submitted", "Cleared", "Discrepant"];

export function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", agent: "", page: 1 });
  const [pages, setPages] = useState(1);

  useEffect(() => {
    loadCases();
  }, [filters.page, filters.status, filters.agent]);

  useEffect(() => {
    api.get("/cases/stats").then(({ data }) => setStats(data));
    if (user?.role === "Manager") {
      api.get("/users/agents").then(({ data }) => setAgents(data.agents));
    }
  }, [user]);

  async function loadCases(overrides = {}) {
    const next = { ...filters, ...overrides };
    const { data } = await api.get("/cases", { params: { ...next, search: next.search || undefined, status: next.status || undefined, agent: next.agent || undefined } });
    setCases(data.cases);
    setPages(data.pages);
    setFilters(next);
  }

  function handleSearch(event) {
    event.preventDefault();
    loadCases({ page: 1 });
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4">{user?.role === "Manager" ? "Case Operations" : "My Assigned Cases"}</Typography>
          <Typography color="text.secondary">Track assignments, submissions, documents, comments, and verdicts.</Typography>
        </Box>
        {user?.role === "Manager" && (
          <Button component={Link} to="/cases/new" variant="contained" sx={{ alignSelf: { xs: "stretch", md: "center" } }}>
            New Case
          </Button>
        )}
      </Stack>

      {stats && (
        <Grid container spacing={2}>
          {Object.entries(stats.stats).map(([label, value]) => (
            <Grid item xs={6} md={2} key={label}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h5">{value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={6} md={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">Overdue</Typography>
                <Typography variant="h5" color="error">{stats.overdue}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 2 }}>
        <Stack component="form" onSubmit={handleSearch} direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            fullWidth
          />
          <TextField select label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} sx={{ minWidth: 190 }}>
            {statuses.map((status) => <MenuItem key={status || "all"} value={status}>{status || "All statuses"}</MenuItem>)}
          </TextField>
          {user?.role === "Manager" && (
            <TextField select label="Agent" value={filters.agent} onChange={(e) => setFilters({ ...filters, agent: e.target.value, page: 1 })} sx={{ minWidth: 220 }}>
              <MenuItem value="">All agents</MenuItem>
              {agents.map((agent) => <MenuItem key={agent._id} value={agent._id}>{agent.name}</MenuItem>)}
            </TextField>
          )}
          <Tooltip title="Run search">
            <IconButton type="submit" color="primary" sx={{ alignSelf: "center" }}>
              Go
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Due</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Agent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases.map((item) => (
              <TableRow key={item._id} hover component={Link} to={`/cases/${item._id}`} sx={{ cursor: "pointer" }}>
                <TableCell>{item.clientName}</TableCell>
                <TableCell>{item.subjectName}</TableCell>
                <TableCell>{item.caseType}</TableCell>
                <TableCell>{format(new Date(item.dueDate), "dd MMM yyyy")}</TableCell>
                <TableCell><StatusChip status={item.status} /></TableCell>
                <TableCell>{item.assignedAgent?.name || "Unassigned"}</TableCell>
              </TableRow>
            ))}
            {!cases.length && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>No cases found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Pagination count={pages} page={filters.page} onChange={(event, page) => setFilters({ ...filters, page })} />
    </Stack>
  );
}
