import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
  },
  reducers: {
    setProducts: (state, action) => {
      state.list = action.payload;
    },

    updateProduct: (state, action) => {
      const { index, field, value } = action.payload;
      state.list[index][field] = value;
    },

    addProduct: (state, action) => {
      state.list.push(action.payload);
    },

    deleteProduct: (state, action) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
  },
});

export const { setProducts, updateProduct, addProduct, deleteProduct } =
  productSlice.actions;
export default productSlice.reducer;
