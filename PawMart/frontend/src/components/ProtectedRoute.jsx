
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p className="p-10 text-center text-stone-500">
        กำลังตรวจสอบบัญชี...
      </p>
    );
  }

  // ถ้ายังไม่ได้เข้าสู่ระบบ ให้ไปหน้า Login
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ตรวจสอบสิทธิ์ Admin
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // รองรับทั้ง Nested Route และ children
  return children || <Outlet />;
}
