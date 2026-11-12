
import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/orders')
      .then((data) => setOrders(data.orders || []))
      .catch((err) => {
        setError(
          err.response?.data?.message ||
          err.message ||
          'ไม่สามารถโหลดประวัติคำสั่งซื้อได้'
        )
      })
      .finally(() => setLoading(false))
  }, [])

  // แปลงสถานะเป็นภาษาไทย
  const getStatus = (status) => {
    const statuses = {
      pending: 'รอดำเนินการ',
      processing: 'กำลังเตรียมสินค้า',
      shipped: 'กำลังจัดส่ง',
      completed: 'จัดส่งสำเร็จ',
      cancelled: 'ยกเลิกแล้ว',
    }

    return statuses[status] || status
  }

  // รูปแบบราคา
  const formatPrice = (price) =>
    Number(price).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <main className="min-h-screen bg-[#FFFCF5] px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <p className="font-bold text-orange-500">
            PAWMART / MY ORDERS
          </p>

          <h1 className="mt-2 text-3xl font-black text-[#5B3D2B]">
            ประวัติคำสั่งซื้อ
          </h1>

          <p className="mt-2 text-stone-500">
            ตรวจสอบรายการสินค้าและสถานะการสั่งซื้อของคุณ
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="text-stone-500">
              กำลังโหลดประวัติคำสั่งซื้อ...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-600">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-orange-500 px-5 py-2 font-bold text-white hover:bg-orange-600"
            >
              ลองอีกครั้ง
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="text-6xl">🐾</div>

            <h2 className="mt-4 text-xl font-bold text-[#5B3D2B]">
              ยังไม่มีคำสั่งซื้อ
            </h2>

            <p className="mt-2 text-stone-500">
              เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่หน้านี้
            </p>
          </div>
        )}

        {/* Order List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 bg-[#FFF8E9] p-5">
                  <div>
                    <p className="text-sm text-stone-500">
                      หมายเลขคำสั่งซื้อ
                    </p>

                    <h2 className="text-lg font-black text-[#5B3D2B]">
                      #{order.id}
                    </h2>
                  </div>

                  <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
                    {getStatus(order.status)}
                  </span>
                </div>

                <div className="space-y-5 p-5">

                  {/* Date */}
                  <div>
                    <p className="text-sm text-stone-500">
                      วันที่สั่งซื้อ
                    </p>

                    <p className="mt-1 font-medium text-[#5B3D2B]">
                      {new Date(order.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>

                  {/* Products */}
                  <div>
                    <h3 className="mb-3 font-bold text-[#5B3D2B]">
                      รายการสินค้า
                    </h3>

                    <div className="space-y-3">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={`${item.product_id}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-[#FFFCF5] p-4"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-[#5B3D2B]">
                              {item.product_name}
                            </p>

                            <p className="mt-1 text-sm text-stone-500">
                              ฿{formatPrice(item.price)} × {item.quantity} ชิ้น
                            </p>
                          </div>

                          <p className="shrink-0 font-bold text-orange-600">
                            ฿{formatPrice(item.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="rounded-2xl bg-[#FFF8E9] p-4">
                    <h3 className="font-bold text-[#5B3D2B]">
                      ข้อมูลการจัดส่ง
                    </h3>

                    <p className="mt-2 text-sm text-stone-600">
                      ที่อยู่: {order.address}
                    </p>

                    <p className="mt-1 text-sm text-stone-600">
                      เบอร์โทรศัพท์: {order.phone}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between border-t border-dashed border-orange-200 pt-4">
                    <span className="font-bold text-[#5B3D2B]">
                      ยอดรวมทั้งสิ้น
                    </span>

                    <span className="text-2xl font-black text-orange-600">
                      ฿{formatPrice(order.total)}
                    </span>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
