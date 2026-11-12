
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        const destination = location.state?.from?.pathname || "/";

        navigate(destination, { replace: true });
      }
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
    <main className="mx-auto max-w-md px-4 py-14">
      <form
        onSubmit={submit}
        className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm"
      >
        <p className="font-bold text-orange-600">WELCOME BACK</p>

        <h1 className="mt-2 text-3xl font-black text-[#5b3d2b]">
          เข้าสู่ระบบ
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          เข้าสู่ระบบเพื่อเลือกซื้อสินค้าสำหรับเพื่อนตัวโปรด
        </p>

        <label className="mt-6 block text-sm font-bold text-[#5b3d2b]">
          อีเมล
        </label>

        <input
          required
          type="email"
          placeholder="กรอกอีเมล"
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
          {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <p className="mt-5 text-center text-sm text-stone-500">
          ยังไม่มีบัญชี?
          <Link
            to="/register"
            state={location.state}
            className="ml-1 font-bold text-orange-700 hover:text-orange-900"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </form>
    </main>
  );
}
