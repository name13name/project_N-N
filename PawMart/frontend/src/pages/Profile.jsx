import { useAuth } from '../context/AuthContext'
export default function Profile() {
  const { user } = useAuth()
  return <main className="mx-auto max-w-2xl px-4 py-10"><h1 className="text-3xl font-black">โปรไฟล์ของฉัน</h1><div className="mt-6 space-y-3 rounded-2xl bg-white p-6"><p><b>ชื่อ:</b> {user?.name}</p><p><b>อีเมล:</b> {user?.email}</p><p><b>สิทธิ์:</b> {user?.role}</p></div></main>
}
