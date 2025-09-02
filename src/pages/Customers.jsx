import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCustomers } from "../redux/slices/customerSlice";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TableComponent from "../pages/TableComponent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import AdminTopBar from "../components/AdminTopBar";

const Customers = () => {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.list);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchCustomers = async () => {
      const snapshot = await getDocs(collection(db, "users"));

      const usersData = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();

        const joinedAtISO = d.joinedAt ? d.joinedAt.toDate().toISOString() : "";

        const purchases = (d.purchases || [])
          .filter((p) => p && (p.product || p.quantity || p.date))
          .map((p) => ({
            product: p.product || "",
            quantity: Number(p.quantity) || 0,
            date: p.date ? p.date.toDate().toISOString() : "",
          }));

        return {
          id: docSnap.id,
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          username: d.username || "",
          email: d.email || "",
          role: d.role || "",
          allowOthersToSeeOrders: !!d.allowOthersToSeeOrders,
          joinedAt: joinedAtISO,
          purchases,
        };
      });

      dispatch(setCustomers(usersData));
    };

    fetchCustomers();
  }, [dispatch]);

  const columns = [
    { key: "fullName", label: "Full Name" },
    { key: "joinedAt", label: "Joined At" },
    {
      key: "purchases",
      label: "Products Bought",
      render: (value) => {
        const rows = (value || []).filter((p) => p && p.product);

        if (rows.length === 0) {
          return <span style={{ color: "#777" }}>—</span>;
        }

        return (
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": { py: 0.5, borderBottom: "none" },
              width: "100%",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.date
                      ? new Date(item.date).toLocaleDateString("en-GB")
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      },
    },
  ];

  const rows = customers.map((c) => ({
    fullName: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
    joinedAt: c.joinedAt
      ? new Date(c.joinedAt).toLocaleDateString("en-GB")
      : "",
    purchases: c.purchases || [],
  }));

  return (
    <Box>
      <AdminTopBar
        adminName={`${currentUser?.firstName ?? "Admin"} ${
          currentUser?.lastName ?? ""
        }`.trim()}
      />

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Customers
        </Typography>

        <Paper elevation={1} sx={{ p: 2 }}>
          <TableComponent columns={columns} rows={rows} />
        </Paper>
      </Box>
    </Box>
  );
};

export default Customers;
