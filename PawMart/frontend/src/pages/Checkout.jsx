import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
export default function Checkout({ cart, clearCart }) {
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const total = cart.reduce((s, x) => s + Number(x.price) * x.quantity, 0)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await api('/orders', { method: 'POST', body: JSON.stringify({ address, phone, items: cart.map(x => ({ product_id: x.id, quantity: x.quantity })) }) })
      clearCart(); navigate('/orders')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  if (!cart.length) return <p className="p-12 text-center">ไม่มีสินค้าในตะกร้า</p>
  return <main className="mx-auto max-w-xl px-4 py-10"><h1 className="text-3xl font-black">ยืนยันคำสั่งซื้อ</h1><form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
    <label className="block font-semibold">ที่อยู่จัดส่ง<textarea required value={address} onChange={e => setAddress(e.target.value)} className="mt-2 w-full rounded-xl border p-3" rows="3" /></label>
    <label className="block font-semibold">เบอร์โทรศัพท์<input required value={phone} onChange={e => setPhone(e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>
    <p className="text-xl font-black text-orange-700">ยอดรวม ฿{total.toLocaleString('th-TH')}</p>
    {error && <p className="text-red-600">{error}</p>}<button disabled={busy} className="w-full rounded-full bg-orange-500 p-3 font-bold text-white disabled:opacity-50">{busy ? 'กำลังสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}</button>
    <p className="text-xs text-stone-500">ระบบนี้บันทึกคำสั่งซื้อ แต่ยังไม่ตัดเงินจริงหรือรับชำระเงินออนไลน์</p>
  </form></main>
}
