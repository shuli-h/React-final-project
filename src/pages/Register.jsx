import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    allowOthers: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await setDoc(doc(db, "users", user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        allowOthersToSeeOrders: form.allowOthers,
        role: "customer",
        joinedAt: serverTimestamp(),
        purchases: [],
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Paper elevation={2} sx={{ p: 4, width: "100%", maxWidth: 520 }}>
        <Typography variant="h5" align="center" gutterBottom>
          New User Registration
        </Typography>
        <Box component="form" onSubmit={handleRegister}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First Name"
                name="firstName"
                value={form.firstName}
                required
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                required
                onChange={handleChange}
                fullWidth
              />
            </Stack>
            <TextField
              label="Username"
              name="username"
              value={form.username}
              required
              onChange={handleChange}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              required
              onChange={handleChange}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              required
              onChange={handleChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="allowOthers"
                  checked={form.allowOthers}
                  onChange={handleChange}
                />
              }
              label="Allow others to see my orders"
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" fullWidth>
              Create
            </Button>
            <Typography variant="body2" align="center">
              Already have an account? <Link to="/login">Log in</Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
