
import { Link } from "react-router-dom";
import { useState } from "react";

export default function CategoryCard({ category }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.slug)}`}
      className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="h-40 w-full overflow-hidden bg-orange-50 sm:h-48">
        {category.image && !imageError ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            onLoad={() => console.log("โหลดรูปสำเร็จ:", category.image)}
            onError={() => {
              console.log("โหลดรูปไม่สำเร็จ:", category.image);
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl">
            {category.emoji}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-[#5b3d2b]">
          {category.name}
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          {category.description}
        </p>

        <p className="mt-3 text-sm font-bold text-orange-600">
          เลือกดูสินค้า →
        </p>
      </div>
    </Link>
  );
}
