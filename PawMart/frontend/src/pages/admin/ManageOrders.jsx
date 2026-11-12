import { useEffect, useState } from "react";
import API from "../../services/api";

const statusOptions = [
  { value: "pending", label: "รอดำเนินการ" },
  { value: "processing", label: "กำลังเตรียมสินค้า" },
  { value: "shipped", label: "จัดส่งแล้ว" },
  { value: "delivered", label: "ส่งสำเร็จ" },
  { value: "cancelled", label: "ยกเลิก" },
];

const statusStyle = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function formatDate(date) {
  return new Date(date).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/orders");
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "ไม่สามารถโหลดคำสั่งซื้อได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function changeStatus(orderId, status) {
    try {
      setUpdating(orderId);

      await API.put(`/admin/orders/${orderId}/status`, { status });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      setSelectedOrder((current) =>
        current?.id === orderId ? { ...current, status } : current
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "ไม่สามารถเปลี่ยนสถานะคำสั่งซื้อได้"
      );
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-[#5b3d2b]">
        กำลังโหลดคำสั่งซื้อ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf0] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#5b3d2b]">
              จัดการคำสั่งซื้อ
            </h1>
            <p className="mt-1 text-sm text-[#9a806b]">
              ตรวจสอบและอัปเดตสถานะคำสั่งซื้อของสมาชิก
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="rounded-xl bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600"
          >
            รีเฟรชข้อมูล
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">
            {typeof error === "string" ? error : "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-orange-100 bg-white p-5">
          <p className="text-sm text-[#9a806b]">คำสั่งซื้อทั้งหมด</p>
          <p className="mt-1 text-3xl font-bold text-[#5b3d2b]">
            {orders.length}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center text-[#9a806b]">
            ยังไม่มีคำสั่งซื้อ
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-orange-100 bg-white shadow-sm">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-orange-50 text-[#5b3d2b]">
                <tr>
                  <th className="p-4">เลขที่คำสั่งซื้อ</th>
                  <th className="p-4">สมาชิก</th>
                  <th className="p-4">ยอดรวม</th>
                  <th className="p-4">วันที่สั่งซื้อ</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4">รายละเอียด</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-orange-50">
                    <td className="p-4 font-semibold text-[#5b3d2b]">
                      #{order.id}
                    </td>

                    <td className="p-4">
                      <p className="font-medium text-[#5b3d2b]">
                        {order.user_name || "ไม่พบชื่อสมาชิก"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user_email || "-"}
                      </p>
                    </td>

                    <td className="p-4 font-semibold text-orange-600">
                      ฿{Number(order.total).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="p-4 text-gray-600">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) =>
                          changeStatus(order.id, e.target.value)
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-semibold outline-none ${
                          statusStyle[order.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg bg-orange-100 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-200"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* หน้าต่างรายละเอียดคำสั่งซื้อ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#5b3d2b]">
                คำสั่งซื้อ #{selectedOrder.id}
              </h2>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-5 space-y-2 rounded-xl bg-orange-50 p-4 text-sm">
              <p>
                <strong>สมาชิก:</strong>{" "}
                {selectedOrder.user_name || "-"}
              </p>
              <p>
                <strong>อีเมล:</strong>{" "}
                {selectedOrder.user_email || "-"}
              </p>
              <p>
                <strong>เบอร์โทร:</strong> {selectedOrder.phone}
              </p>
              <p>
                <strong>ที่อยู่:</strong> {selectedOrder.address}
              </p>
              <p>
                <strong>วันที่สั่งซื้อ:</strong>{" "}
                {formatDate(selectedOrder.created_at)}
              </p>
            </div>

            <h3 className="mb-3 font-bold text-[#5b3d2b]">
              รายการสินค้า
            </h3>

            <div className="space-y-3">
              {(Array.isArray(selectedOrder.items)
                ? selectedOrder.items
                : []
              ).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 border-b border-orange-50 pb-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-[#5b3d2b]">
                      {item.product_name}
                    </p>
                    <p className="text-gray-500">
                      {item.quantity} ชิ้น × ฿{Number(item.price).toLocaleString("th-TH")}
                    </p>
                  </div>

                  <p className="font-semibold text-orange-600">
                    ฿{Number(item.subtotal).toLocaleString("th-TH")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-bold text-[#5b3d2b]">ยอดรวม</span>
              <span className="text-xl font-bold text-orange-600">
                ฿{Number(selectedOrder.total).toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}