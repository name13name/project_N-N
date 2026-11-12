import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
export default function ProductDetail({ onAdd }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api(`/products/${id}`).then(d => setProduct(d.product)).catch(e => setError(e.message)) }, [id])
  if (error) return <p className="p-12 text-center text-red-600">{error}</p>
  if (!product) return <p className="p-12 text-center">กำลังโหลด...</p>
  return <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
    <img src={product.image_url} alt={product.name} className="w-full rounded-3xl object-cover" />
    <div><p className="font-bold text-orange-600">{product.category_name}</p><h1 className="mt-2 text-3xl font-black">{product.name}</h1><p className="mt-4 leading-7 text-stone-600">{product.description}</p><p className="mt-6 text-3xl font-black text-orange-700">฿{Number(product.price).toLocaleString('th-TH')}</p><p className="mt-2 text-sm text-stone-500">คงเหลือ {product.stock} ชิ้น</p><button onClick={() => onAdd(product)} disabled={product.stock < 1} className="mt-6 rounded-full bg-orange-500 px-7 py-3 font-bold text-white disabled:bg-stone-300">เพิ่มลงตะกร้า</button></div>
  </main>
}
