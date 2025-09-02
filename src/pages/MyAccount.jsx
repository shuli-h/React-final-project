import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
} from "@mui/material";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const MyAccount = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    allowOthersToSeeOrders: false,
    joinedAt: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        setUid(user.uid);
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setForm({
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            username: d.username || "",
            email: d.email || user.email || "",
            allowOthersToSeeOrders: !!d.allowOthersToSeeOrders,
            joinedAt: d.joinedAt
              ? d.joinedAt.toDate().toLocaleDateString("en-GB")
              : "",
          });
        } else {
          setForm((prev) => ({ ...prev, email: user.email || "" }));
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSave = async () => {
    if (!uid) return;

    const payload = {
      firstName: form.firstName || "",
      lastName: form.lastName || "",
      username: form.username || "",
      email: form.email || "",
      allowOthersToSeeOrders: !!form.allowOthersToSeeOrders,
    };

    if (!form.joinedAt) {
      payload.joinedAt = serverTimestamp();
    }

    setSaving(true);
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        await updateDoc(userRef, payload);
      } else {
        await setDoc(userRef, payload, { merge: true });
      }

      alert("Profile updated");

      if (!form.joinedAt) {
        const refreshed = await getDoc(userRef);
        if (refreshed.exists()) {
          const d = refreshed.data();
          setForm((prev) => ({
            ...prev,
            joinedAt: d.joinedAt
              ? d.joinedAt.toDate().toLocaleDateString("en-GB")
              : prev.joinedAt,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Saving failed: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 4 }}>
      {}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Link to="/catalog">Products</Link>
        <Link to="/orders">My Orders</Link>
        <Link to="/account">My Account</Link>
      </Box>

      <Typography variant="h4" gutterBottom>
        My Account
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <TextField
            label="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            // InputProps={{ readOnly: true }}
          />
          <TextField
            label="Joined At"
            value={form.joinedAt}
            InputProps={{ readOnly: true }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.allowOthersToSeeOrders}
                onChange={(e) =>
                  setForm({
                    ...form,
                    allowOthersToSeeOrders: e.target.checked,
                  })
                }
              />
            }
            label="Allow others to see my orders"
          />
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MyAccount;
