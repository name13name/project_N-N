import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px 20px", background: "#f5f5f5", display: "flex", gap: "15px", alignItems: "center" }}>
      <strong style={{ fontSize: "1.2rem" }}>🐾 PawMart</strong>
      <Link to="/">หน้าแรก</Link>
      <Link to="/products">สินค้า</Link>
      <Link to="/cart">ตะกร้า</Link>
      <Link to="/orders">รายการสั่งซื้อ</Link>
      <Link to="/login" style={{ marginLeft: "auto" }}>เข้าสู่ระบบ</Link>
    </nav>
  );
}
