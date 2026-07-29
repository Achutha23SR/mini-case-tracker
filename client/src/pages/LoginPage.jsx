import { Alert, Avatar, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "manager@example.com", password: "Password123!" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/cases");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in");
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", px: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 420, p: 4 }}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>L</Avatar>
            <Typography variant="h5">Sign in</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Use the seeded Manager or Agent credentials from the README.
            </Typography>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
          <Button type="submit" variant="contained" disabled={loading} size="large">
            Sign in
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
