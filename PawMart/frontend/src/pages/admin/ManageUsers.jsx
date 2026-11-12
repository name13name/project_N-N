import { useEffect, useState } from "react";
import API from "../../services/api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "ไม่สามารถโหลดข้อมูลสมาชิกได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const search = keyword.toLowerCase();

    return (
      String(user.id).includes(search) ||
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  });

  function formatDate(date) {
    return new Date(date).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="min-h-screen bg-[#fffaf0] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#5b3d2b]">
              จัดการสมาชิก
            </h1>
            <p className="mt-1 text-sm text-[#9a806b]">
              ตรวจสอบข้อมูลบัญชีสมาชิกในระบบ PawMart
            </p>
          </div>

          <button
            onClick={loadUsers}
            className="rounded-xl bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600"
          >
            รีเฟรชข้อมูล
          </button>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-orange-100 bg-white p-5">
            <p className="text-sm text-[#9a806b]">บัญชีทั้งหมด</p>
            <p className="mt-1 text-3xl font-bold text-[#5b3d2b]">
              {users.length}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5">
            <p className="text-sm text-[#9a806b]">สมาชิกทั่วไป</p>
            <p className="mt-1 text-3xl font-bold text-orange-500">
              {users.filter((user) => user.role === "member").length}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ อีเมล หรือรหัสสมาชิก..."
            className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-[#5b3d2b]">
            กำลังโหลดข้อมูลสมาชิก...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">
            {typeof error === "string" ? error : "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center text-[#9a806b]">
            ไม่พบข้อมูลสมาชิก
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-orange-100 bg-white shadow-sm">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-orange-50 text-[#5b3d2b]">
                <tr>
                  <th className="p-4">รหัสสมาชิก</th>
                  <th className="p-4">ชื่อ</th>
                  <th className="p-4">อีเมล</th>
                  <th className="p-4">สิทธิ์การใช้งาน</th>
                  <th className="p-4">วันที่สมัคร</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-orange-50">
                    <td className="p-4 font-semibold text-[#5b3d2b]">
                      #{user.id}
                    </td>

                    <td className="p-4 font-medium text-[#5b3d2b]">
                      {user.name}
                    </td>

                    <td className="p-4 text-gray-600">
                      {user.email}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "Member"}
                      </span>
                    </td>

                    <td className="p-4 text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-[#9a806b]">
          แสดงข้อมูลบัญชีเท่านั้น ระบบจะไม่เปิดเผยรหัสผ่านของสมาชิก
        </p>
      </div>
    </div>
  );
}