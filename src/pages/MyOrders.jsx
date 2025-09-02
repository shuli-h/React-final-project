import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Link as MuiLink } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { clearCurrentUser } from "../redux/slices/userSlice";
import TableComponent from "./TableComponent";

const MyOrders = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const purchases = currentUser?.purchases || [];
  const rows = purchases.map((p, idx) => ({
    id: idx,
    product: p.product,
    quantity: p.quantity,
    date: p.date ? p.date.toDate().toLocaleDateString("en-GB") : "",
  }));
  const columns = [
    { key: "product", label: "Product" },
    { key: "quantity", label: "Qty" },
    { key: "date", label: "Date" },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <MuiLink component={Link} to="/catalog">
          Products
        </MuiLink>
        <MuiLink component={Link} to="/orders" sx={{ fontWeight: "bold" }}>
          My Orders
        </MuiLink>
        <MuiLink component={Link} to="/account">
          My Account
        </MuiLink>
        <Button
          variant="outlined"
          size="small"
          onClick={async () => {
            await signOut(auth);
            dispatch(clearCurrentUser());
            navigate("/login");
          }}
          sx={{ ml: "auto" }}
        >
          Logout
        </Button>
      </Box>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      {purchases.length === 0 ? (
        <Typography>No orders found.</Typography>
      ) : (
        <TableComponent columns={columns} rows={rows} />
      )}
    </Box>
  );
};

export default MyOrders;
