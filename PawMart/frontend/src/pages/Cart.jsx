
import { Link, useNavigate } from "react-router-dom";

export default function Cart({ cart = [], onChangeQty, onRemove }) {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const formatPrice = (price) =>
    Number(price).toLocaleString("th-TH");

  return (
    <main className="min-h-screen bg-[#FFFCF5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#FFF0D5] px-4 py-2 text-sm font-bold text-orange-700">
            <span>🐾</span>
            PAWMART SHOPPING
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#5B3D2B] sm:text-4xl">
            ตะกร้าสินค้าของคุณ
          </h1>

          <p className="mt-2 text-sm text-stone-500 sm:text-base">
            เลือกสิ่งดี ๆ ให้เพื่อนตัวโปรด ก่อนดำเนินการสั่งซื้อ
          </p>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart */
          <section className="rounded-[2rem] border border-orange-100 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#FFF5DF] text-6xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-black text-[#5B3D2B]">
              ตะกร้ายังว่างอยู่นะ!
            </h2>

            <p className="mt-3 text-stone-500">
              ลองไปเลือกขนม ของเล่น หรืออาหารให้สัตว์เลี้ยงกันเถอะ
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-md shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              เลือกซื้อสินค้า
              <span>→</span>
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-7 lg:grid-cols-3">

            {/* Product List */}
            <section className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between rounded-2xl bg-[#FFF4DE] px-5 py-4">
                <div>
                  <h2 className="font-black text-[#5B3D2B]">
                    สินค้าในตะกร้า
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    ตรวจสอบรายการสินค้าของคุณ
                  </p>
                </div>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-600">
                  {totalItems} ชิ้น
                </span>
              </div>

              {cart.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col gap-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
                >
                  {/* Product Image */}
                  <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-[#FFF8E9] sm:h-28 sm:w-28">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://placehold.co/400x400?text=PawMart";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        🐾
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-[#FFF1DB] px-3 py-1 text-xs font-bold text-orange-700">
                      {item.category || "สินค้า PawMart"}
                    </span>

                    <h3 className="mt-2 text-lg font-black text-[#5B3D2B]">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-stone-500">
                      ราคาต่อชิ้น
                    </p>

                    <p className="mt-1 font-bold text-orange-600">
                      ฿{formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-3 rounded-full border border-orange-100 bg-[#FFFCF5] p-1">
                      <button
                        type="button"
                        onClick={() => onChangeQty(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0D5] font-bold text-orange-700 transition hover:bg-orange-200 disabled:opacity-40"
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center font-black text-[#5B3D2B]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => onChangeQty(item.id, 1)}
                        disabled={
                          item.stock != null &&
                          item.quantity >= Number(item.stock)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0D5] font-bold text-orange-700 transition hover:bg-orange-200 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-stone-400">
                        รวมรายการนี้
                      </p>
                      <p className="mt-1 font-black text-[#5B3D2B]">
                        ฿{formatPrice(
                          Number(item.price) * item.quantity
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="text-sm font-semibold text-red-400 transition hover:text-red-600"
                    >
                      ลบสินค้า
                    </button>
                  </div>
                </article>
              ))}

              <Link
                to="/products"
                className="inline-flex items-center gap-2 py-3 text-sm font-bold text-orange-600 transition hover:text-orange-800"
              >
                <span>←</span>
                เลือกซื้อสินค้าเพิ่มเติม
              </Link>
            </section>

            {/* Order Summary */}
            <aside className="sticky top-24 rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0D5] text-2xl">
                  🧾
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#5B3D2B]">
                    สรุปคำสั่งซื้อ
                  </h2>
                  <p className="text-xs text-stone-400">
                    Order Summary
                  </p>
                </div>
              </div>

              <div className="my-6 space-y-4">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>จำนวนสินค้า</span>
                  <span className="font-bold text-[#5B3D2B]">
                    {totalItems} ชิ้น
                  </span>
                </div>

                <div className="flex justify-between text-sm text-stone-500">
                  <span>ค่าจัดส่ง</span>
                  <span>คำนวณภายหลัง</span>
                </div>

                <div className="border-t border-dashed border-orange-200" />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-[#5B3D2B]">
                    ยอดรวมสินค้า
                  </span>

                  <span className="text-2xl font-black text-orange-600">
                    ฿{formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="w-full rounded-full bg-orange-500 px-6 py-4 font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                ดำเนินการสั่งซื้อ →
              </button>

              <div className="mt-5 rounded-2xl bg-[#FFFAEE] p-4 text-center">
                <p className="text-sm font-bold text-[#8A674E]">
                  🐶 ขอบคุณที่เลือก PawMart
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  เราดีใจที่ได้ดูแลเพื่อนตัวโปรดของคุณ
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
