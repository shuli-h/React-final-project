import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategories } from "../redux/slices/categorySlice";
import {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../redux/slices/productSlice";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase";
import TableComponent from "./TableComponent";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import AdminTopBar from "../components/AdminTopBar";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.list);
  const products = useSelector((state) => state.products.list);
  const admin = useSelector((s) => s.user.currentUser);

  const [users, setUsers] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [formValues, setFormValues] = useState({
    title: "",
    price: "",
    category: "",
    img: "",
    description: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const categorySnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = categorySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      dispatch(setCategories(categoriesData));

      const productSnapshot = await getDocs(collection(db, "products"));
      const productsData = productSnapshot.docs.map((d) => {
        const pd = d.data();

        const boughtBy = (pd.boughtBy || [])
          .filter((b) => b && (b.name || b.qty || b.date))
          .map((b) => ({
            name: b.name || "",
            qty: Number(b.qty) || 0,
            date: b.date ? b.date.toDate().toISOString() : "",
          }));

        return {
          id: d.id,
          title: pd.title || "",
          price: Number(pd.price) || 0,
          category: pd.category || "",
          img: pd.img || "",
          description: pd.description || "",
          quantity: pd.quantity ?? undefined,
          boughtBy,
        };
      });
      dispatch(setProducts(productsData));

      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setUsers(usersData);
    };

    fetchData();
  }, [dispatch]);

  const computePurchasesForProduct = (productTitle) => {
    const result = [];
    users.forEach((user) => {
      const purchases = user.purchases || [];
      purchases.forEach((purchase) => {
        if (purchase?.product === productTitle) {
          result.push({
            name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            qty: Number(purchase.quantity) || 0,
            date: purchase.date ? purchase.date.toDate().toISOString() : "",
          });
        }
      });
    });
    return result;
  };

  const filteredProducts = products.filter((product) =>
    (product.title || "")
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const rows = filteredProducts.map((product) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    purchases: computePurchasesForProduct(product.title),
  }));

  const columns = [
    { key: "title", label: "Product" },
    {
      key: "price",
      label: "Price",
      render: (value) => `₪${Number(value).toFixed(2)}`,
    },
    { key: "category", label: "Category" },
    {
      key: "purchases",
      label: "Customers Bought",
      render: (value) => {
        const rows = (value || []).filter((r) => r && r.name);
        if (rows.length === 0) {
          return <span style={{ color: "#777" }}>—</span>;
        }
        return (
          <Table
            size="small"
            sx={{ "& .MuiTableCell-root": { py: 0.5, borderBottom: "none" } }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.qty}</TableCell>
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
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <>
          <Button
            size="small"
            onClick={() => handleEdit(row.id)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const handleEdit = (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setSelectedProductId(id);
    setFormValues({
      title: product.title || "",
      price: product.price || "",
      category: product.category || "",
      img: product.img || "",
      description: product.description || "",
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    dispatch(deleteProduct(id));
    if (selectedProductId === id) {
      setSelectedProductId(null);
      setFormValues({
        title: "",
        price: "",
        category: "",
        img: "",
        description: "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (
      !formValues.title ||
      !formValues.price ||
      !formValues.category ||
      !formValues.img
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (selectedProductId) {
      await setDoc(doc(db, "products", selectedProductId), {
        ...formValues,
        price: Number(formValues.price),
      });
      const index = products.findIndex((p) => p.id === selectedProductId);
      dispatch(
        updateProduct({ index, field: "title", value: formValues.title })
      );
      dispatch(
        updateProduct({
          index,
          field: "price",
          value: Number(formValues.price),
        })
      );
      dispatch(
        updateProduct({ index, field: "category", value: formValues.category })
      );
      dispatch(updateProduct({ index, field: "img", value: formValues.img }));
      dispatch(
        updateProduct({
          index,
          field: "description",
          value: formValues.description,
        })
      );
    } else {
      const id = uuidv4();
      const newProduct = {
        id,
        ...formValues,
        price: Number(formValues.price),
      };
      await setDoc(doc(db, "products", id), newProduct);
      dispatch(addProduct(newProduct));
    }

    setSelectedProductId(null);
    setFormValues({
      title: "",
      price: "",
      category: "",
      img: "",
      description: "",
    });
  };

  return (
    <Box>
      <AdminTopBar
        adminName={`${admin?.firstName ?? "Admin"} ${
          admin?.lastName ?? ""
        }`.trim()}
      />

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Product Management
        </Typography>

        {}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            label="Search by product title"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Paper>

        {}
        <Paper sx={{ p: 2 }}>
          <TableComponent columns={columns} rows={rows} />
        </Paper>

        {}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            {selectedProductId ? "Edit Product" : "New Product"}
          </Typography>
          <Paper sx={{ p: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              fullWidth
              sx={{ my: 1 }}
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              value={formValues.price}
              onChange={handleChange}
              fullWidth
              sx={{ my: 1 }}
            />
            <TextField
              label="Image URL"
              name="img"
              value={formValues.img}
              onChange={handleChange}
              fullWidth
              sx={{ my: 1 }}
            />
            <TextField
              label="Description"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              multiline
              minRows={2}
              fullWidth
              sx={{ my: 1 }}
            />
            <Select
              name="category"
              value={formValues.category}
              onChange={handleChange}
              displayEmpty
              fullWidth
              sx={{ my: 1 }}
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.name || c.category || c.title}>
                  {c.name || c.category || c.title}
                </MenuItem>
              ))}
            </Select>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
              {selectedProductId && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDelete(selectedProductId)}
                >
                  Delete
                </Button>
              )}
              {!selectedProductId && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedProductId(null);
                    setFormValues({
                      title: "",
                      price: "",
                      category: "",
                      img: "",
                      description: "",
                    });
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductsPage;
