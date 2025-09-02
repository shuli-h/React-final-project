import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { setProducts } from "../redux/slices/productSlice";
import { setCategories } from "../redux/slices/categorySlice";
import {
  addItem,
  updateItemQuantity,
  removeItem,
} from "../redux/slices/cartSlice";
import Cart from "../components/Cart";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { clearCurrentUser } from "../redux/slices/userSlice";

const Catalog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector((state) => state.products.list);
  const categories = useSelector((state) => state.categories.list);
  const cartItems = useSelector((state) => state.cart.items);
  const currentUser = useSelector((state) => state.user.currentUser);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (products.length === 0) {
        const productSnap = await getDocs(collection(db, "products"));
        const productData = productSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        dispatch(setProducts(productData));
      }
      if (categories.length === 0) {
        const catSnap = await getDocs(collection(db, "categories"));
        const catData = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        dispatch(setCategories(catData));
      }

      const userSnap = await getDocs(collection(db, "users"));
      const userData = userSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(userData);
    };
    fetchData();
  }, [dispatch]);

  //allowOthersToSeeOrders=true
  const soldMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      if (!u.allowOthersToSeeOrders) return;
      (u.purchases || []).forEach((p) => {
        map[p.product] = (map[p.product] || 0) + p.quantity;
      });
    });
    return map;
  }, [users]);

  const maxProductPrice = useMemo(() => {
    return products.length > 0
      ? Math.max(...products.map((p) => Number(p.price) || 0))
      : 0;
  }, [products]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory
      ? p.category === selectedCategory
      : true;
    const matchesTitle = search
      ? (p.title || "").toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesPrice = maxPrice > 0 ? Number(p.price) <= maxPrice : true;
    return matchesCategory && matchesTitle && matchesPrice;
  });

  const handleIncrement = (product) => {
    const cartItem = cartItems.find((i) => i.productId === product.id);
    const currentQty = cartItem ? cartItem.quantity : 0;

    if (product.quantity !== undefined && currentQty >= product.quantity)
      return;
    dispatch(
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
      })
    );
  };

  const handleDecrement = (product) => {
    const cartItem = cartItems.find((i) => i.productId === product.id);
    if (!cartItem) return;
    if (cartItem.quantity === 1) {
      dispatch(removeItem(product.id));
    } else {
      dispatch(
        updateItemQuantity({
          productId: product.id,
          quantity: cartItem.quantity - 1,
        })
      );
    }
  };

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((i) => i.productId === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <Box sx={{ p: 4 }}>
      {}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <Link to="/catalog" style={{ textDecoration: "none" }}>
          Products
        </Link>
        <Link to="/orders" style={{ textDecoration: "none" }}>
          My Orders
        </Link>
        <Link to="/account" style={{ textDecoration: "none" }}>
          My Account
        </Link>
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
        Products Catalog
      </Typography>

      {}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.name || c.category || c.title}>
                {c.name || c.category || c.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Search title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Box sx={{ width: 200 }}>
          <Typography id="price-slider" gutterBottom>
            Max Price: {maxPrice || "All"}
          </Typography>
          <Slider
            aria-labelledby="price-slider"
            min={0}
            max={maxProductPrice}
            value={maxPrice}
            onChange={(e, newValue) => setMaxPrice(newValue)}
          />
        </Box>
      </Box>

      {}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 2,
        }}
      >
        {filteredProducts.map((product) => {
          const sold = soldMap[product.title] || 0;
          const cartQty = getCartQuantity(product.id);
          return (
            <Card
              key={product.id}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              {product.img && (
                <CardMedia
                  component="img"
                  height="140"
                  image={product.img}
                  alt={product.title}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{product.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="body2">
                  Category: {product.category}
                </Typography>
                <Typography variant="body2">Price: ₪{product.price}</Typography>
                {product.quantity !== undefined && (
                  <Typography variant="body2">
                    Available: {product.quantity}
                  </Typography>
                )}
                <Typography variant="body2">Sold: {sold}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <IconButton
                    onClick={() => handleDecrement(product)}
                    disabled={cartQty === 0}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ mx: 1 }}>{cartQty}</Typography>
                  <IconButton
                    onClick={() => handleIncrement(product)}
                    disabled={
                      product.quantity !== undefined &&
                      cartQty >= product.quantity
                    }
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {}
      <Cart />
    </Box>
  );
};

export default Catalog;
