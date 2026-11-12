
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ cartCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-orange-100 bg-[#fffaf0]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* โลโก้ */}
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

          <NavLink
            to="/cart"
            className="flex items-center gap-1 hover:text-orange-600"
          >
            🛒 ตะกร้า
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs text-white">
                {cartCount}
              </span>
            )}
          </NavLink>

          {user ? (
            <>
              {/* เมนูของสมาชิก */}
              {user.role !== "admin" && (
                <NavLink to="/orders" className="hover:text-orange-600">
                  คำสั่งซื้อ
                </NavLink>
              )}

              {/* เมนู Admin */}
              {user.role === "admin" && (
                <NavLink
                  to="/admin/dashboard"
                  className="font-bold text-orange-700 hover:text-orange-900"
                >
                  🛠 Admin Dashboard
                </NavLink>
              )}

              {/* กลุ่มบัญชีและออกจากระบบ */}
              <div className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 p-1">
                <NavLink
                  to="/profile"
                  className="rounded-full px-3 py-1.5 text-stone-700 transition hover:bg-white hover:text-orange-600"
                >
                  👤 บัญชีของฉัน
                </NavLink>

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="rounded-full bg-orange-500 px-3 py-1.5 text-white transition hover:bg-orange-600"
                >
                  ออกจากระบบ
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-orange-600">
                เข้าสู่ระบบ
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-orange-500 px-3 py-1.5 text-white transition hover:bg-orange-600"
              >
                สมัครสมาชิก
              </Link>

              {/* ทางเข้า Admin แยกจากสมาชิก */}
              <Link
                to="/admin/login"
                className="rounded-full border border-orange-300 px-3 py-1.5 font-bold text-orange-700 transition hover:bg-orange-100"
              >
                🛠 Admin Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
