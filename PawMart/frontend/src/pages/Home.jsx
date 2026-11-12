
import { useEffect, useState } from "react";
import API from "../services/api";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";

// หมวดหมู่หลักของ PawMart กำหนดไว้ตายตัว
const categories = [
  {
    id: 1,
    name: "สุนัข",
    slug: "หมา",
    description: "อาหาร ขนม และสินค้าสำหรับสุนัข",
    emoji: "🐶",
    image: "/Golden-Retriever.jpg", // วางลิงก์รูปสุนัขตรงนี้
  },
  {
    id: 2,
    name: "แมว",
    slug: "แมว",
    description: "อาหาร ขนม และสินค้าสำหรับแมว",
    emoji: "🐱",
    image: "/cat.jpg", // วางลิงก์รูปแมวตรงนี้
  },
  {
    id: 3,
    name: "ของใช้",
    slug: "ของใช้",
    description: "อุปกรณ์ดูแลและของใช้สัตว์เลี้ยง",
    emoji: "🧴",
    image: "/pet-supplies.jpg", // วางลิงก์รูปของใช้ตรงนี้
  },
  {
    id: 4,
    name: "ของเล่น",
    slug: "ของเล่น",
    description: "ของเล่นแสนสนุกสำหรับเพื่อนตัวโปรด",
    emoji: "🧸",
    image: "/pet-toys.jpg", // วางลิงก์รูปของเล่นตรงนี้
  },
];

export default function Home({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/products?limit=4");

        setProducts(response.data.products || []);
      } catch (err) {
        console.error("Home API Error:", err);
        setError("ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">

      {/* Hero */}
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-50 p-8 md:p-14">
        <p className="font-bold text-orange-700">
          WELCOME TO PAWMART
        </p>

        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-[#5b3d2b] md:text-5xl">
          ทุกความสุขของสัตว์เลี้ยง เริ่มต้นที่นี่ 🐶🐱
        </h1>

        <p className="mt-4 max-w-xl text-stone-600">
          เลือกซื้ออาหาร ขนม ของเล่น และของใช้สำหรับเพื่อนตัวโปรดของคุณ
        </p>

        <a
          href="#categories"
          className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
        >
          เลือกหมวดหมู่สินค้า
        </a>
      </section>

      {/* หมวดหมู่สินค้า */}
      <section id="categories" className="mt-12">
        <h2 className="text-2xl font-black text-[#5b3d2b]">
          เลือกช้อปตามหมวดหมู่
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </section>

      {/* สินค้าแนะนำ */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#5b3d2b]">
            สินค้าแนะนำ
          </h2>

          <a
            href="/products"
            className="font-bold text-orange-700 hover:text-orange-900"
          >
            ดูสินค้าทั้งหมด →
          </a>
        </div>

        {loading ? (
          <p className="py-8 text-stone-500">กำลังโหลดสินค้า...</p>
        ) : error ? (
          <p className="py-8 text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="py-8 text-stone-500">ยังไม่มีสินค้าแนะนำ</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
              />
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
