import { useEffect, useState } from 'react'
import { api } from '../../services/api'
const blank = { name: '', description: '', price: '', stock: '', image_url: '', category_id: '' }
export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  async function load() {
    const [p,c] = await Promise.all([api('/products'), api('/categories')])
    setProducts(p.products || []); setCategories(c.categories || [])
  }
  useEffect(() => { load().catch(e => setError(e.message)) }, [])
  function edit(p) {
    setEditing(p.id)
    setForm({ name:p.name, description:p.description, price:String(p.price), stock:String(p.stock), image_url:p.image_url, category_id:String(p.category_id) })
    window.scrollTo({ top:0, behavior:'smooth' })
  }
  async function save(e) {
    e.preventDefault(); setError('')
    const body = { ...form, price:Number(form.price), stock:Number(form.stock), category_id:Number(form.category_id) }
    try {
      await api(editing ? `/admin/products/${editing}` : '/admin/products', { method:editing ? 'PATCH' : 'POST', body:JSON.stringify(body) })
      setForm(blank); setEditing(null); await load()
    } catch(e) { setError(e.message) }
  }
  async function remove(id) {
    if (!confirm('ต้องการลบสินค้านี้หรือไม่?')) return
    try { await api(`/admin/products/${id}`, { method:'DELETE' }); await load() } catch(e) { setError(e.message) }
  }
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <h1 className="text-3xl font-black">จัดการสินค้า</h1>
    <form onSubmit={save} className="mt-5 grid gap-3 rounded-2xl bg-white p-5 sm:grid-cols-2">
      <input required placeholder="ชื่อสินค้า" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="rounded-xl border p-3" />
      <select required value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="rounded-xl border p-3"><option value="">เลือกหมวดหมู่</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input required type="number" min="0" step="0.01" placeholder="ราคา" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="rounded-xl border p-3" />
      <input required type="number" min="0" placeholder="สต็อก" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} className="rounded-xl border p-3" />
      <input placeholder="URL รูปภาพ" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} className="rounded-xl border p-3 sm:col-span-2" />
      <textarea placeholder="รายละเอียด" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="rounded-xl border p-3 sm:col-span-2" />
      <button className="rounded-full bg-orange-500 p-3 font-bold text-white sm:col-span-2">{editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button>
      {editing && <button type="button" onClick={()=>{setEditing(null);setForm(blank)}} className="rounded-full bg-stone-200 p-3 sm:col-span-2">ยกเลิกการแก้ไข</button>}
      {error && <p className="text-red-600 sm:col-span-2">{error}</p>}
    </form>
    <div className="mt-6 space-y-2">{products.map(p=><div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4"><span>{p.name} — ฿{p.price} (คงเหลือ {p.stock})</span><div className="flex gap-3"><button onClick={()=>edit(p)} className="font-semibold text-blue-700">แก้ไข</button><button onClick={()=>remove(p.id)} className="text-red-600">ลบ</button></div></div>)}</div>
  </main>
}
