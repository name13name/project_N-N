import { useEffect, useState } from 'react'
import { api } from '../services/api'
export default function Orders() {
  const [orders, setOrders] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => { api('/orders').then(d => setOrders(d.orders || [])).catch(e => setError(e.message)).finally(() => setLoading(false)) }, [])
  return <main className="mx-auto max-w-4xl px-4 py-10"><h1 className="text-3xl font-black">ประวัติคำสั่งซื้อ</h1>{loading ? <p className="py-10">กำลังโหลด...</p> : error ? <p className="py-10 text-red-600">{error}</p> : orders.length === 0 ? <p className="py-10 text-stone-500">ยังไม่มีคำสั่งซื้อ</p> : <div className="mt-6 space-y-4">{orders.map(o => <article key={o.id} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex justify-between"><b>คำสั่งซื้อ #{o.id}</b><span className="text-orange-700">{o.status}</span></div><p className="mt-2">ยอดรวม ฿{Number(o.total).toLocaleString('th-TH')}</p><p className="text-sm text-stone-500">{new Date(o.created_at).toLocaleString('th-TH')}</p><p className="mt-1 text-sm">จัดส่ง: {o.address}</p></article>)}</div>}</main>
}
