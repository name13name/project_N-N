
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // ถ้าเป็น Admin และเข้าสู่ระบบอยู่แล้ว
  if (user?.role === "admin") {
    navigate("/admin/dashboard", { replace: true });
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role !== "admin") {
        setError("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบ Admin");
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[85vh] items-center justify-center bg-[#fffaf0] px-4 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-7 shadow-sm"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
            🐾
          </div>

          <p className="mt-4 font-bold tracking-widest text-orange-600">
            PAWMART ADMIN
          </p>

          <h1 className="mt-2 text-3xl font-black text-[#5b3d2b]">
            ผู้ดูแลระบบ
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            เข้าสู่ระบบเพื่อจัดการร้าน PawMart
          </p>
        </div>

        <label className="block text-sm font-bold text-[#5b3d2b]">
          อีเมลผู้ดูแลระบบ
        </label>

        <input
          required
          type="email"
          placeholder="กรอกอีเมล Admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-orange-200 p-3 outline-orange-400"
        />

        <label className="mt-4 block text-sm font-bold text-[#5b3d2b]">
          รหัสผ่าน
        </label>

        <input
          required
          type="password"
          placeholder="กรอกรหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-orange-200 p-3 outline-orange-400"
        />

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-full bg-orange-500 p-3 font-bold text-white transition hover:bg-orange-600 disabled:bg-stone-300"
        >
          {busy ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ Admin"}
        </button>

        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="text-sm font-bold text-orange-700 hover:text-orange-900"
          >
            ← กลับไปหน้าเข้าสู่ระบบสมาชิก
          </Link>
        </div>
      </form>
    </main>
  );
}
