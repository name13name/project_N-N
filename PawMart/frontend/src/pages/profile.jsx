
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // นำชื่อและอีเมลจากบัญชีที่เข้าสู่ระบบมาแสดง
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // บันทึกข้อมูลส่วนตัว
  async function handleUpdateProfile(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await API.put("/profile", {
        name,
        email,
      });

      updateUser(res.data.user);
      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  }

  // เปลี่ยนรหัสผ่าน
  async function handleChangePassword(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      await API.put("/profile/password", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setMessage("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาตรวจสอบรหัสผ่านเดิม"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fffaf0] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* หัวข้อ */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5b3d2b]">
            บัญชีของฉัน
          </h1>
          <p className="mt-2 text-[#92745f]">
            จัดการข้อมูลส่วนตัวและรหัสผ่านของคุณ
          </p>
        </div>

        {/* ข้อมูลสมาชิก */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
              🐾
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#5b3d2b]">
                {user?.name || "สมาชิก PawMart"}
              </h2>

              <p className="text-sm text-[#92745f]">
                {user?.role === "admin"
                  ? "ผู้ดูแลระบบ"
                  : "สมาชิก PawMart"}
              </p>

              <p className="mt-1 text-sm text-[#92745f]">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* แจ้งเตือน */}
        {message && (
          <div className="mb-4 rounded-xl bg-green-100 p-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* แก้ไขข้อมูลส่วนตัว */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#5b3d2b]">
            ข้อมูลส่วนตัว
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5b3d2b]">
                ชื่อ
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5b3d2b]">
                อีเมล
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>

          </form>
        </div>

        {/* เปลี่ยนรหัสผ่าน */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#5b3d2b]">
            เปลี่ยนรหัสผ่าน
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">

            <input
              type="password"
              placeholder="รหัสผ่านปัจจุบัน"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-400"
            />

            <input
              type="password"
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-400"
            />

            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#5b3d2b] px-6 py-3 font-semibold text-white hover:bg-[#79543c] disabled:opacity-50"
            >
              {loading ? "กำลังดำเนินการ..." : "เปลี่ยนรหัสผ่าน"}
            </button>

          </form>
        </div>

        {/* ประวัติคำสั่งซื้อ */}
        <Link
          to="/orders"
          className="inline-block font-medium text-orange-600 hover:text-orange-700"
        >
          ดูประวัติคำสั่งซื้อ →
        </Link>

      </div>
    </div>
  );
}
