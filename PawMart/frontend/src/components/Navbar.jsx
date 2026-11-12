
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ cartCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-orange-100 bg-[#fffaf0]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-2xl font-black text-orange-600">
          🐾 PawMart
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <NavLink to="/" className="hover:text-orange-600">
            หน้าแรก
          </NavLink>

          <NavLink to="/products" className="hover:text-orange-600">
            สินค้า
          </NavLink>

          <NavLink to="/cart" className="flex items-center gap-1 hover:text-orange-600">
            🛒 ตะกร้า
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs text-white">
                {cartCount}
              </span>
            )}
          </NavLink>

          {user ? (
            <>
              <NavLink to="/profile" className="hover:text-orange-600">
                บัญชีของฉัน
              </NavLink>

              <NavLink to="/orders" className="hover:text-orange-600">
                คำสั่งซื้อ
              </NavLink>

              {user.role === "admin" && (
                <NavLink to="/admin/dashboard" className="text-orange-700">
                  Admin
                </NavLink>
              )}

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-full bg-orange-100 px-3 py-1.5 text-orange-800"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-orange-600">
                เข้าสู่ระบบ
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-orange-500 px-3 py-1.5 text-white"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
