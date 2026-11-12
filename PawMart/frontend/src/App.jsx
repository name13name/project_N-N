import Register from "./pages/Register";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";

function App() {
  // โหลดตะกร้าจาก localStorage เมื่อเปิดเว็บ
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("pawmart_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // บันทึกตะกร้าทุกครั้งที่มีการเปลี่ยนแปลง
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

  // เพิ่มหรือลดจำนวนสินค้า
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

  // จำนวนสินค้ารวมทุกชิ้น
  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <Navbar cartCount={cartCount} />

      <Routes>
        {/* หน้าทั่วไป */}
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home onAdd={handleAddToCart} />} />
        <Route
          path="/products"
          element={<Products onAdd={handleAddToCart} />}
        />
        <Route path="/login" element={<Login />} />

        {/* หน้าสำหรับสมาชิก */}
        <Route element={<ProtectedRoute />}>
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
          <Route path="/checkout" element={<Checkout cart={cart} />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

        {/* หน้าสำหรับ Admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
