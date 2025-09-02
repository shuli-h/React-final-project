import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import AdminTopBar from "../components/AdminTopBar";

const Statistics = () => {
  const theme = useTheme();
  const admin = useSelector((s) => s.user.currentUser);

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setUsers(usersData);

      const productsSnap = await getDocs(collection(db, "products"));
      const productsData = productsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setProducts(productsData);
    };
    fetchData();
  }, []);

  const pieData = useMemo(() => {
    const totals = {};
    users.forEach((user) => {
      const purchases = user.purchases || [];
      purchases.forEach((purchase) => {
        const name = purchase?.product || "";
        const qty = Number(purchase?.quantity) || 0;
        if (!name) return;
        totals[name] = (totals[name] || 0) + qty;
      });
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [users]);

  const barData = useMemo(() => {
    if (!selectedUserId) return [];
    const currentUser = users.find((u) => u.id === selectedUserId);
    if (!currentUser || !currentUser.purchases) return [];
    const totals = {};
    currentUser.purchases.forEach((purchase) => {
      const name = purchase?.product || "";
      const qty = Number(purchase?.quantity) || 0;
      if (!name) return;
      totals[name] = (totals[name] || 0) + qty;
    });
    return Object.entries(totals).map(([name, qty]) => ({ name, qty }));
  }, [selectedUserId, users]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];

  return (
    <Box>
      <AdminTopBar
        adminName={`${admin?.firstName ?? "Admin"} ${
          admin?.lastName ?? ""
        }`.trim()}
      />

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Statistics
        </Typography>

        {}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" align="center" gutterBottom>
            Total Sold Products
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Products Quantity Per Customer
          </Typography>

          {}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="customer-select-label">Select Customer</InputLabel>
            <Select
              labelId="customer-select-label"
              value={selectedUserId}
              label="Select Customer"
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {(u.firstName || "") + " " + (u.lastName || "")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {}
          {selectedUserId && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="qty"
                  fill={theme.palette.primary.main}
                  label={{ position: "top" }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Statistics;
