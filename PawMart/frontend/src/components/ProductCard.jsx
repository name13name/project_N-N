
import { Link } from 'react-router-dom'

export default function ProductCard({ product, onAdd }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      {/* รูปสินค้า */}
      <Link to={`/products/${product.id}`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full bg-orange-50 object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = 'https://placehold.co/400x400?text=PawMart'
            }}
          />
        ) : (
          <div className="flex h-48 items-center justify-center bg-orange-50 text-5xl">
            🐾
          </div>
        )}
      </Link>

      <div className="p-4">

        {/* หมวดหมู่ */}
        <p className="text-xs font-semibold text-orange-600">
          {product.category}
        </p>

        {/* ชื่อสินค้า */}
        <Link
          to={`/products/${product.id}`}
          className="mt-1 block min-h-12 font-bold text-[#5b3d2b] hover:text-orange-600"
        >
          {product.name}
        </Link>

        {/* รายละเอียด */}
        <p className="mt-2 min-h-10 text-sm text-stone-500 line-clamp-2">
          {product.description}
        </p>

        {/* ราคาและปุ่ม */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-black text-orange-700">
            ฿{Number(product.price).toLocaleString('th-TH')}
          </span>

          <button
            disabled={product.stock < 1}
            onClick={() => onAdd(product)}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600 disabled:bg-stone-300"
          >
            เพิ่มลงตะกร้า
          </button>
        </div>

      </div>
    </article>
  )
}
