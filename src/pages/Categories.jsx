import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../redux/slices/categorySlice";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminTopBar from "../components/AdminTopBar";
import { useSelector as useReduxSelector } from "react-redux";

export default function Categories() {
  const dispatch = useDispatch();
  const categories = useSelector((s) => s.categories.list);
  const user = useReduxSelector((s) => s.user.currentUser);

  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      dispatch(setCategories(data));
    };
    fetchCategories();
  }, [dispatch]);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    const ref = await addDoc(collection(db, "categories"), {
      name: newCategory.trim(),
    });
    dispatch(addCategory({ id: ref.id, name: newCategory.trim() }));
    setNewCategory("");
  };

  const handleUpdate = async (id) => {
    await updateDoc(doc(db, "categories", id), { name: editingName.trim() });
    dispatch(updateCategory({ id, name: editingName.trim() }));
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "categories", id));
    dispatch(deleteCategory(id));
  };

  return (
    <Box>
      <AdminTopBar
        adminName={`${user?.firstName ?? "Admin"} ${
          user?.lastName ?? ""
        }`.trim()}
      />

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Categories
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleAdd}>
              Add
            </Button>
          </Stack>
        </Paper>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}>#</TableCell>
                <TableCell>Category Name</TableCell>
                <TableCell align="right" sx={{ width: 140 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat, idx) => (
                <TableRow key={cat.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    {editingId === cat.id ? (
                      <TextField
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      cat.name
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editingId === cat.id ? (
                      <IconButton
                        color="primary"
                        onClick={() => handleUpdate(cat.id)}
                      >
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditingName(cat.name);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>No categories yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}
