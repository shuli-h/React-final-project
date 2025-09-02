import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./slices/categorySlice";
import customerReducer from "./slices/customerSlice";
import productReducer from "./slices/productSlice";
import userReducer from "./slices/userSlice";
import cartReducer from "./slices/cartSlice";

const store = configureStore({
  reducer: {
    categories: categoryReducer,
    customers: customerReducer,
    products: productReducer,
    user: userReducer,
    cart: cartReducer,
  },
});

export default store;
