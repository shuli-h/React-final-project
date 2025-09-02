import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
  },
  reducers: {
    setCategories: (state, action) => {
      state.list = action.payload;
    },
    addCategory: (state, action) => {
      state.list.push(action.payload);
    },
    updateCategory: (state, action) => {
      const { id, name } = action.payload;
      const category = state.list.find((cat) => cat.id === id);
      if (category) {
        category.name = name;
      }
    },
    deleteCategory: (state, action) => {
      state.list = state.list.filter((cat) => cat.id !== action.payload);
    },
  },
});

export const { setCategories, addCategory, updateCategory, deleteCategory } =
  categorySlice.actions;

export default categorySlice.reducer;
