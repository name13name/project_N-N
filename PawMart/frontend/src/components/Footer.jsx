export default function Footer() {
  return <footer className="mt-16 bg-[#5b3d2b] px-4 py-8 text-center text-sm text-orange-50">
    <p className="text-lg font-bold">🐾 PawMart</p>
    <p className="mt-1">ร้านรวมสินค้าเพื่อเพื่อนตัวโปรดของคุณ</p>
    <p className="mt-3 text-orange-200">© {new Date().getFullYear()} PawMart</p>
  </footer>
}
