
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

export default function Checkout({ cart = [], clearCart }) {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const formatPrice = (price) =>
    Number(price).toLocaleString("th-TH");

  async function submit(e) {
    e.preventDefault();

    if (cart.length === 0) {
      setError("ไม่มีสินค้าในตะกร้า");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          address,
          phone,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      // ล้างตะกร้าเมื่อสั่งซื้อสำเร็จเท่านั้น
      clearCart();

      navigate("/orders", {
        state: { success: "สั่งซื้อสินค้าสำเร็จแล้วค่ะ" },
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "ไม่สามารถสั่งซื้อสินค้าได้ กรุณาลองใหม่"
      );
    } finally {
      setBusy(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#FFFCF5] px-4 py-20 text-center">
        <div className="text-6xl">🛒</div>
        <h2 className="mt-5 text-2xl font-black text-[#5B3D2B]">
          ไม่มีสินค้าในตะกร้า
        </h2>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-full bg-orange-500 px-7 py-3 font-bold text-white"
        >
          เลือกซื้อสินค้า
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFCF5] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <p className="font-bold text-orange-600">
            PAWMART CHECKOUT
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#5B3D2B]">
            ยืนยันคำสั่งซื้อ 🐾
          </h1>
          <p className="mt-2 text-stone-500">
            กรอกข้อมูลสำหรับจัดส่งสินค้าให้เพื่อนตัวโปรด
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* ที่อยู่ */}
          <div>
            <label className="font-bold text-[#5B3D2B]">
              ที่อยู่จัดส่ง
            </label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด และรหัสไปรษณีย์"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#FFFCF5] p-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div>
            <label className="font-bold text-[#5B3D2B]">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="กรอกเบอร์โทรศัพท์"
              className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#FFFCF5] p-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* รายการสินค้า */}
          <div>
            <h2 className="mb-4 font-black text-[#5B3D2B]">
              รายการสินค้า ({cart.length} รายการ)
            </h2>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#FFFAEE] p-4"
                >
                  <div>
                    <p className="font-bold text-[#5B3D2B]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      จำนวน {item.quantity} ชิ้น
                    </p>
                  </div>

                  <p className="shrink-0 font-bold text-orange-600">
                    ฿{formatPrice(
                      Number(item.price) * item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ยอดรวม */}
          <div className="rounded-2xl bg-[#FFF3DA] p-5">
            <div className="flex justify-between">
              <span className="font-bold text-[#5B3D2B]">
                ยอดรวมสินค้า
              </span>
              <span className="text-2xl font-black text-orange-600">
                ฿{formatPrice(total)}
              </span>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              ค่าจัดส่งยังไม่รวมในยอดนี้
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-orange-500 px-6 py-4 font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "กำลังบันทึกคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ →"}
          </button>

          <p className="text-center text-xs text-stone-400">
            ระบบนี้ยังไม่รองรับการชำระเงินออนไลน์
          </p>
        </form>
      </div>
    </main>
  );
}
