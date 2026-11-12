
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Products from "./Products";
import API from "../services/api";

// จำลอง API ไม่ให้เรียก Backend จริง
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

// จำลอง ProductCard เพื่อทดสอบหน้า Products โดยตรง
vi.mock("../components/ProductCard", () => ({
  default: ({ product, onAdd }) => (
    <div>
      <h2>{product.name}</h2>
      <p>ราคา {product.price} บาท</p>
      <button onClick={() => onAdd(product)}>เพิ่มลงตะกร้า</button>
    </div>
  ),
}));

const mockProducts = [
  {
    id: 1,
    name: "อาหารสุนัข",
    description: "อาหารสำหรับสุนัข",
    category: "หมา",
    price: 100,
  },
  {
    id: 2,
    name: "อาหารแมว",
    description: "อาหารสำหรับแมว",
    category: "แมว",
    price: 150,
  },
];

function renderProducts(onAdd = vi.fn()) {
  render(
    <MemoryRouter>
      <Products onAdd={onAdd} />
    </MemoryRouter>
  );

  return onAdd;
}

describe("Products Unit Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: แสดงข้อความระหว่างโหลดสินค้า
  it("แสดงข้อความกำลังโหลดสินค้า", () => {
    API.get.mockReturnValue(new Promise(() => {}));

    renderProducts();

    expect(
      screen.getByText("กำลังโหลดสินค้า...")
    ).toBeInTheDocument();
  });

  // Test 2: แสดงรายการสินค้าจาก API
  it("แสดงรายการสินค้าที่โหลดสำเร็จ", async () => {
    API.get.mockResolvedValue({
      data: { products: mockProducts },
    });

    renderProducts();

    expect(
      await screen.findByText("อาหารสุนัข")
    ).toBeInTheDocument();

    expect(
      screen.getByText("อาหารแมว")
    ).toBeInTheDocument();
  });

  // Test 3: ค้นหาสินค้าจากชื่อ
  it("ค้นหาสินค้าจากชื่อได้", async () => {
    API.get.mockResolvedValue({
      data: { products: mockProducts },
    });

    renderProducts();

    await screen.findByText("อาหารสุนัข");

    fireEvent.change(
      screen.getByPlaceholderText("ค้นหาสินค้า..."),
      { target: { value: "แมว" } }
    );

    expect(screen.getByText("อาหารแมว")).toBeInTheDocument();
    expect(screen.queryByText("อาหารสุนัข")).not.toBeInTheDocument();
  });

  // Test 4: แสดงข้อความเมื่อไม่มีสินค้า
  it("แสดงข้อความเมื่อไม่พบสินค้า", async () => {
    API.get.mockResolvedValue({
      data: { products: [] },
    });

    renderProducts();

    expect(
      await screen.findByText("ไม่พบสินค้าในหมวดหมู่นี้")
    ).toBeInTheDocument();
  });

  // Test 5: แสดงข้อความเมื่อโหลดสินค้าไม่สำเร็จ
  it("แสดงข้อความเมื่อ API เกิดข้อผิดพลาด", async () => {
    API.get.mockRejectedValue(new Error("Network Error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderProducts();

    expect(
      await screen.findByText("ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่")
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  // Test 6: เรียกฟังก์ชันเมื่อกดเพิ่มสินค้าลงตะกร้า
  it("เรียกฟังก์ชันเพิ่มสินค้าลงตะกร้าได้", async () => {
    API.get.mockResolvedValue({
      data: { products: mockProducts },
    });

    const onAdd = renderProducts();

    await screen.findByText("อาหารสุนัข");

    fireEvent.click(
      screen.getAllByText("เพิ่มลงตะกร้า")[0]
    );

    expect(onAdd).toHaveBeenCalledWith(mockProducts[0]);
  });
});
