
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await register(name, email, password);

      // กลับไปหน้าที่ต้องการก่อนสมัครสมาชิก
      const destination = location.state?.from?.pathname || "/";

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่"
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
        <p className="font-bold text-orange-600">
          JOIN PAWMART
        </p>

        <h1 className="mt-2 text-3xl font-black text-[#5b3d2b]">
          สมัครสมาชิก
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          สร้างบัญชีเพื่อเริ่มช้อปสินค้าสำหรับสัตว์เลี้ยง
        </p>

        <label className="mt-6 block text-sm font-bold text-[#5b3d2b]">
          ชื่อที่แสดง
        </label>

        <input
          required
          type="text"
          placeholder="กรอกชื่อของคุณ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-orange-200 p-3 outline-orange-400"
        />

        <label className="mt-4 block text-sm font-bold text-[#5b3d2b]">
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
          minLength={8}
          type="password"
          placeholder="รหัสผ่านอย่างน้อย 8 ตัว"
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
          {busy ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </button>

        <p className="mt-5 text-center text-sm text-stone-500">
          มีบัญชีแล้ว?
          <Link
            to="/login"
            state={location.state}
            className="ml-1 font-bold text-orange-700 hover:text-orange-900"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </main>
  );
}
