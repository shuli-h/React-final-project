import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const LinkBtn = ({ to, label }) => {
  const loc = useLocation();
  const active = loc.pathname.startsWith(to);
  return (
    <Button
      component={Link}
      to={to}
      sx={{
        color: active ? "primary.contrastText" : "rgba(255,255,255,0.9)",
        opacity: active ? 1 : 0.9,
        textTransform: "none",
        fontWeight: active ? 700 : 500,
      }}
    >
      {label}
    </Button>
  );
};

export default function AdminTopBar({ adminName = "Admin" }) {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Hello, {adminName}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <LinkBtn to="/admin/categories" label="Categories" />
          <LinkBtn to="/admin/products" label="Products" />
          <LinkBtn to="/admin/customers" label="Customers" />
          <LinkBtn to="/admin/statistics" label="Statistics" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
