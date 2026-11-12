
import { Link, useNavigate } from "react-router-dom";

export default function Cart({ cart = [], onChangeQty, onRemove }) {
  const navigate = useNavigate();

  // คำนวณยอดรวมสินค้า
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // จัดรูปแบบราคา
  const formatPrice = (price) =>
    Number(price).toLocaleString("th-TH");

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      {/* หัวข้อ */}
      <div>
        <p className="font-bold text-orange-600">MY SHOPPING CART</p>
        <h1 className="mt-2 text-3xl font-black text-[#5b3d2b]">
          ตะกร้าสินค้า 🛒
        </h1>
        <p className="mt-2 text-stone-500">
          ตรวจสอบสินค้าก่อนดำเนินการสั่งซื้อ
        </p>
      </div>

      {cart.length === 0 ? (
        /* กรณีไม่มีสินค้า */
        <div className="mt-10 rounded-3xl border border-orange-100 bg-white px-5 py-16 text-center shadow-sm">
          <div className="text-7xl">🛍️</div>

          <h2 className="mt-5 text-xl font-bold text-[#5b3d2b]">
            ยังไม่มีสินค้าในตะกร้า
          </h2>

          <p className="mt-2 text-stone-500">
            ไปเลือกสินค้าน่ารัก ๆ ให้เพื่อนตัวโปรดกันเถอะ
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-full bg-orange-500 px-7 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* รายการสินค้า */}
          <section className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#5b3d2b]">
                สินค้าของคุณ
              </h2>

              <span className="text-sm text-stone-500">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
              </span>
            </div>

            {cart.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                {/* รูปสินค้า */}
                <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#FFF8E9] sm:h-24 sm:w-24">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      🐾
                    </div>
                  )}
                </div>

                {/* รายละเอียดสินค้า */}
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                    {item.category}
                  </span>

                  <h3 className="mt-2 font-bold text-[#5b3d2b]">
                    {item.name}
                  </h3>

                  <p className="mt-1 font-bold text-orange-600">
                    ฿{formatPrice(item.price)}
                  </p>
                </div>

                {/* จำนวนสินค้า */}
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onChangeQty(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="h-9 w-9 rounded-full bg-orange-100 font-bold text-orange-700 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="min-w-6 text-center font-bold text-[#5b3d2b]">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onChangeQty(item.id, 1)}
                      disabled={
                        item.stock != null &&
                        item.quantity >= Number(item.stock)
                      }
                      className="h-9 w-9 rounded-full bg-orange-100 font-bold text-orange-700 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-black text-[#5b3d2b]">
                      ฿{formatPrice(Number(item.price) * item.quantity)}
                    </p>

                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="text-sm font-semibold text-red-500 hover:text-red-700"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <Link
              to="/products"
              className="inline-block pt-2 text-sm font-bold text-orange-600 hover:text-orange-800"
            >
              ← เลือกซื้อสินค้าเพิ่มเติม
            </Link>
          </section>

          {/* สรุปยอด */}
          <aside className="h-fit rounded-3xl border border-orange-100 bg-[#FFF8E9] p-6">
            <h2 className="text-xl font-black text-[#5b3d2b]">
              สรุปคำสั่งซื้อ
            </h2>

            <div className="mt-6 flex justify-between text-sm text-stone-600">
              <span>จำนวนสินค้า</span>
              <span>
                {cart.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
              </span>
            </div>

            <div className="mt-4 flex justify-between text-sm text-stone-600">
              <span>ค่าจัดส่ง</span>
              <span>คำนวณในขั้นตอนถัดไป</span>
            </div>

            <div className="my-5 border-t border-orange-200" />

            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5b3d2b]">
                ยอดรวมสินค้า
              </span>

              <span className="text-2xl font-black text-orange-600">
                ฿{formatPrice(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="mt-6 w-full rounded-full bg-orange-500 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-orange-600"
            >
              ดำเนินการสั่งซื้อ →
            </button>

            <p className="mt-4 text-center text-xs text-stone-500">
              ขอบคุณที่เลือกช้อปกับ PawMart 🐾
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
