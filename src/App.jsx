import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Categories from "./pages/Categories";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Statistics from "./pages/Statistics";
import MyAccount from "./pages/MyAccount";
import MyOrders from "./pages/MyOrders";
import Catalog from "./pages/Catalog";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin/categories" element={<Categories />} />
      <Route path="/admin/customers" element={<Customers />} />
      <Route path="/admin/products" element={<Products />} />
      <Route path="/admin/statistics" element={<Statistics />} />

      <Route path="/account" element={<MyAccount />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/catalog" element={<Catalog />} />

      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
