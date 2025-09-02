import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { clearCart } from "../redux/slices/cartSlice";
import {
  updateDoc,
  doc,
  arrayUnion,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { clearCurrentUser } from "../redux/slices/userSlice";
import { signOut } from "firebase/auth";

const PANEL_W = 300;
const HANDLE_W = 40;

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = useSelector((state) => state.cart.items);
  const currentUser = useSelector((state) => state.user.currentUser);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleOrder = async () => {
    if (!currentUser) {
      alert("Please log in to place an order");
      return;
    }
    try {
      const userRef = doc(db, "users", currentUser.id);
      for (const item of items) {
        await updateDoc(userRef, {
          purchases: arrayUnion({
            product: item.title,
            quantity: item.quantity,
            date: serverTimestamp(),
          }),
        });
        await updateDoc(doc(db, "products", item.productId), {
          quantity: increment(-item.quantity),
        });
      }
      dispatch(clearCart());
      dispatch(clearCurrentUser());
      await signOut(auth);
      alert("Order placed successfully");
      navigate("/login");
    } catch (e) {
      alert("Failed to place order");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        right: 0,
        width: PANEL_W,
        height: "calc(100% - 80px)",
        bgcolor: "#f9f9f9",
        boxShadow: open ? 3 : "none",
        overflow: "visible",
        transition: "transform 0.3s",
        transform: open ? "translateX(0)" : "translateX(100%)",
        zIndex: 1000,
        p: 2,
      }}
    >
      {}
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{
          position: "absolute",
          right: "100%",
          top: 20,
          width: HANDLE_W,
          height: 40,
          bgcolor: "white",
          borderRadius: "8px 0 0 8px",
          boxShadow: 2,
        }}
      >
        {open ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
      </IconButton>

      <Typography variant="h6" gutterBottom>
        Cart
      </Typography>

      {items.length === 0 ? (
        <Typography>No items</Typography>
      ) : (
        <List>
          {items.map((item) => (
            <ListItem
              key={item.productId}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <ListItemText
                primary={`${item.title} x ${item.quantity}`}
                secondary={`₪${(item.price * item.quantity).toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Typography sx={{ mt: 2 }}>Total: ₪{total.toFixed(2)}</Typography>
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={items.length === 0}
        onClick={handleOrder}
      >
        Order
      </Button>
    </Box>
  );
};

export default Cart;
