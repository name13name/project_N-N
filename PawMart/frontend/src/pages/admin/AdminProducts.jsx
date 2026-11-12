
import { useEffect, useState } from "react";
import API from "../../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    category: "อาหาร",
    pet_type: "หมา",
    price: "",
    stock: "",
    image: "",
  };

  const [form, setForm] = useState(emptyForm);

  // โหลดรายการสินค้า
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await API.get("/products");
      setProducts(response.data.products || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "ไม่สามารถโหลดสินค้าได้"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // เปลี่ยนค่าฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // เริ่มแก้ไขสินค้า
  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      pet_type: product.pet_type || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: product.image || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ยกเลิกการแก้ไข
  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  // เพิ่มหรือแก้ไขสินค้า
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (editingId) {
        await API.put(`/admin/products/${editingId}`, payload);
        alert("แก้ไขสินค้าสำเร็จ");
      } else {
        await API.post("/admin/products", payload);
        alert("เพิ่มสินค้าสำเร็จ");
      }

      handleCancel();
      await fetchProducts();
    } catch (err) {
      alert(
        err.response?.data?.message || "ไม่สามารถบันทึกสินค้าได้"
      );
    } finally {
      setSaving(false);
    }
  };

  // ลบสินค้า
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "ต้องการลบสินค้านี้ใช่หรือไม่?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/admin/products/${id}`);
      alert("ลบสินค้าสำเร็จ");
      await fetchProducts();
    } catch (err) {
      alert(
        err.response?.data?.message || "ไม่สามารถลบสินค้าได้"
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="font-bold text-orange-500">
            PAWMART ADMIN
          </p>

          <h1 className="mt-2 text-3xl font-black text-[#5b3d2b]">
            จัดการสินค้า 🐾
          </h1>

          <p className="mt-2 text-stone-500">
            เพิ่ม แก้ไข และจัดการสินค้าภายในร้าน
          </p>
        </div>

        {/* ฟอร์มเพิ่มและแก้ไขสินค้า */}
        <section className="mb-10 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#5b3d2b]">
            {editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  ชื่อสินค้า
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border p-3"
                  placeholder="ชื่อสินค้า"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  หมวดหมู่
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border p-3"
                  placeholder="เช่น อาหาร, ของเล่น, ของใช้"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  ประเภทสัตว์
                </label>
                <select
                  name="pet_type"
                  value={form.pet_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border p-3"
                >
                  <option value="หมา">หมา</option>
                  <option value="แมว">แมว</option>
                  <option value="หมาและแมว">หมาและแมว</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  ราคา (บาท)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-xl border p-3"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  จำนวนสินค้า
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full rounded-xl border p-3"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  URL รูปภาพ
                </label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="w-full rounded-xl border p-3"
                  placeholder="https://..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-xl border p-3"
                  placeholder="รายละเอียดสินค้า..."
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : editingId
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มสินค้า"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border px-6 py-3 font-bold text-stone-600"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ตารางสินค้า */}
        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#5b3d2b]">
            รายการสินค้าทั้งหมด ({products.length})
          </h2>

          {loading ? (
            <p className="py-8 text-center text-stone-500">
              กำลังโหลดสินค้า...
            </p>
          ) : error ? (
            <p className="py-8 text-center text-red-500">
              {error}
            </p>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-stone-500">
              ยังไม่มีสินค้าในระบบ
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b bg-orange-50 text-sm text-[#5b3d2b]">
                    <th className="p-3">สินค้า</th>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3">ประเภทสัตว์</th>
                    <th className="p-3">ราคา</th>
                    <th className="p-3">คงเหลือ</th>
                    <th className="p-3">จัดการ</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50">
                              🐾
                            </div>
                          )}

                          <span className="font-semibold text-[#5b3d2b]">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">{product.category}</td>
                      <td className="p-3">{product.pet_type}</td>
                      <td className="p-3">
                        ฿{Number(product.price).toLocaleString("th-TH")}
                      </td>
                      <td className="p-3">{product.stock}</td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800"
                          >
                            แก้ไข
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
