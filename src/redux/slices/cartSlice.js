import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },
  reducers: {
    addItem: (state, action) => {
      const { productId, title, price } = action.payload;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ productId, title, price, quantity: 1 });
      }
    },
    removeItem: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((i) => i.productId !== productId);
    },
    updateItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity = quantity;
        if (existing.quantity <= 0) {
          state.items = state.items.filter((i) => i.productId !== productId);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateItemQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
