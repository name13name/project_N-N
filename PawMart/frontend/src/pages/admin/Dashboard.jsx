import { Link } from 'react-router-dom'
export default function Dashboard() {
  return <main className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-3xl font-black">Admin Dashboard</h1><p className="mt-2 text-stone-500">จัดการข้อมูลร้าน PawMart</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><Link className="rounded-2xl bg-amber-100 p-6 text-xl font-bold" to="/admin/products">จัดการสินค้า →</Link><Link className="rounded-2xl bg-orange-100 p-6 text-xl font-bold" to="/admin/orders">จัดการคำสั่งซื้อ →</Link><Link className="rounded-2xl bg-yellow-100 p-6 text-xl font-bold" to="/admin/users">จัดการสมาชิก →</Link></div></main>
}
