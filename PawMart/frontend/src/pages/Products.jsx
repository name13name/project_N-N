
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

// หมวดหมู่หลักของ PawMart
const categories = [
  { name: "หมา", slug: "หมา" },
  { name: "แมว", slug: "แมว" },
  { name: "ของเล่น", slug: "ของเล่น" },
  { name: "ของใช้", slug: "ของใช้" },
];

export default function Products({ onAdd }) {
  const [params, setParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // อ่านหมวดหมู่จาก URL
  const category = params.get("category") || "";

  // โหลดสินค้าจาก Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/products");

        setProducts(response.data.products || []);
      } catch (err) {
        console.error("Products API Error:", err);
        setError("ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // กรองสินค้าตามหมวดหมู่และคำค้นหา
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        !category || product.category === category;

      const keyword = search.trim().toLowerCase();

      const matchSearch =
        !keyword ||
        product.name?.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword);

      return matchCategory && matchSearch;
    });
  }, [products, category, search]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">

      {/* หัวข้อ */}
      <h1 className="text-3xl font-black text-[#5b3d2b]">
        {category ? `สินค้าหมวดหมู่${category}` : "สินค้าทั้งหมด"}
      </h1>

      <p className="mt-2 text-stone-500">
        เลือกสินค้าที่เหมาะกับเพื่อนตัวโปรดของคุณ
      </p>

      {/* ช่องค้นหาและเลือกหมวดหมู่ */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          className="min-w-0 flex-1 rounded-xl border border-orange-200 bg-white px-4 py-3 outline-orange-400"
        />

        <select
          value={category}
          onChange={(e) => {
            setParams(
              e.target.value
                ? { category: e.target.value }
                : {}
            );
          }}
          className="rounded-xl border border-orange-200 bg-white px-4 py-3"
        >
          <option value="">ทั้งหมด</option>

          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

      </div>

      {/* จำนวนสินค้า */}
      <p className="mt-5 text-sm text-stone-500">
        พบสินค้า {filteredProducts.length} รายการ
      </p>

      {/* แสดงสินค้า */}
      {loading ? (
        <p className="py-12 text-center text-stone-500">
          กำลังโหลดสินค้า...
        </p>
      ) : error ? (
        <p className="py-12 text-center text-red-600">
          {error}
        </p>
      ) : filteredProducts.length === 0 ? (
        <p className="py-12 text-center text-stone-500">
          ไม่พบสินค้าในหมวดหมู่นี้
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}

    </main>
  );
}
