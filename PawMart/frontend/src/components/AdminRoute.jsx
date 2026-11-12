
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  // รอตรวจสอบสถานะการเข้าสู่ระบบ
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf0]">
        <p className="text-[#5b3d2b]">
          กำลังตรวจสอบสิทธิ์...
        </p>
      </div>
    );
  }

  // ถ้ายังไม่ได้เข้าสู่ระบบ ให้ไปหน้า Admin Login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // ถ้าเข้าสู่ระบบแล้วแต่ไม่ใช่ Admin ให้กลับหน้าร้าน
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ถ้าเป็น Admin ให้เข้าใช้งานหน้าจัดการได้
  return <Outlet />;
}
