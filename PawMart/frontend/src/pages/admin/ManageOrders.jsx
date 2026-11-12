import { useEffect, useState } from 'react'
import { api } from '../../services/api'
export default function ManageOrders() {
  const [orders,setOrders] = useState([]); const [error,setError] = useState('')
  async function load(){ const d=await api('/admin/orders'); setOrders(d.orders||[]) }
  useEffect(()=>{load().catch(e=>setError(e.message))},[])
  async function change(id,status){try{await api(`/admin/orders/${id}`,{method:'PATCH',body:JSON.stringify({status})});await load()}catch(e){setError(e.message)}}
  return <main className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-3xl font-black">จัดการคำสั่งซื้อ</h1>{error&&<p className="mt-3 text-red-600">{error}</p>}<div className="mt-6 space-y-3">{orders.map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5"><div><b>#{o.id} · {o.customer_name}</b><p className="text-sm text-stone-500">฿{o.total} · {o.status}</p></div><select value={o.status} onChange={e=>change(o.id,e.target.value)} className="rounded-lg border p-2"><option value="pending">รอดำเนินการ</option><option value="processing">กำลังจัดเตรียม</option><option value="shipped">จัดส่งแล้ว</option><option value="completed">สำเร็จ</option><option value="cancelled">ยกเลิก</option></select></div>)}</div></main>
}
