
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// General Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import Profile from "./pages/profile";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";

function App() {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("pawmart_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // บันทึกตะกร้าสินค้าลง Local Storage
  useEffect(() => {
    localStorage.setItem("pawmart_cart", JSON.stringify(cart));
  }, [cart]);

  // เพิ่มสินค้าลงตะกร้า
  const handleAddToCart = (product) => {
    if (product.stock != null && Number(product.stock) < 1) {
      alert("สินค้าหมดแล้วค่ะ");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        const stockLimit =
          product.stock == null
            ? Infinity
            : Number(product.stock);

        if (existing.quantity >= stockLimit) {
          alert("ไม่สามารถเพิ่มเกินจำนวนสินค้าคงเหลือได้");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  // เปลี่ยนจำนวนสินค้า
  const handleChangeQty = (productId, change) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== productId) return item;

        const stockLimit =
          item.stock == null ? Infinity : Number(item.stock);

        const newQuantity = Math.max(
          1,
          Math.min(item.quantity + change, stockLimit)
        );

        return { ...item, quantity: newQuantity };
      })
    );
  };

  // ลบสินค้าออกจากตะกร้า
  const handleRemove = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  // ล้างตะกร้าสินค้า
  const handleClearCart = () => {
    setCart([]);
  };

  // นับจำนวนสินค้าทั้งหมดในตะกร้า
  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <Navbar cartCount={cartCount} />

      <Routes>
        {/* หน้าทั่วไป */}
        <Route
          path="/"
          element={<Home onAdd={handleAddToCart} />}
        />

        <Route
          path="/products"
          element={<Products onAdd={handleAddToCart} />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* หน้าเข้าสู่ระบบ Admin */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* หน้าสำหรับสมาชิกที่เข้าสู่ระบบแล้ว */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                onChangeQty={handleChangeQty}
                onRemove={handleRemove}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                clearCart={handleClearCart}
              />
            }
          />

          <Route path="/orders" element={<Orders />} />
        </Route>

        {/* หน้าสำหรับ Admin เท่านั้น */}
        <Route element={<AdminRoute />}>
          <Route
            path="/admin/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/orders"
            element={<ManageOrders />}
          />

          <Route
            path="/admin/users"
            element={<ManageUsers />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
