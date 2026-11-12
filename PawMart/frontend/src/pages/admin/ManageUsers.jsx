import { useEffect, useState } from 'react'
import { api } from '../../services/api'
export default function ManageUsers() {
  const [users,setUsers] = useState([])
  const [error,setError] = useState('')
  async function load(){ const d=await api('/admin/users'); setUsers(d.users||[]) }
  useEffect(()=>{load().catch(e=>setError(e.message))},[])
  return <main className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-3xl font-black">จัดการสมาชิก</h1>{error&&<p className="mt-3 text-red-600">{error}</p>}<div className="mt-6 space-y-3">{users.map(u=><div key={u.id} className="rounded-xl bg-white p-4"><b>{u.name}</b><p className="text-sm text-stone-500">{u.email}</p><span className="text-xs font-bold text-orange-700">{u.role}</span></div>)}</div></main>
}
