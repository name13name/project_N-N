
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cart from "./Cart";

// ฟังก์ชันช่วยแสดงหน้า Cart สำหรับทดสอบ
function renderCart(cart = []) {
  const onChangeQty = vi.fn();
  const onRemove = vi.fn();

  render(
    <MemoryRouter>
      <Cart
        cart={cart}
        onChangeQty={onChangeQty}
        onRemove={onRemove}
      />
    </MemoryRouter>
  );

  return { onChangeQty, onRemove };
}

describe("Cart Unit Test", () => {

  // Test 1: ตะกร้าว่าง
  it("แสดงข้อความเมื่อตะกร้าสินค้าว่าง", () => {
    renderCart([]);

    expect(
      screen.getByText("ตะกร้ายังว่างอยู่นะ!")
    ).toBeInTheDocument();
  });

  // Test 2: แสดงสินค้า
  it("แสดงชื่อสินค้าและราคาถูกต้อง", () => {
    renderCart([
      {
        id: 1,
        name: "อาหารสุนัข",
        price: 100,
        quantity: 2,
        stock: 10,
        category: "อาหารสัตว์",
      },
    ]);

    expect(
      screen.getByText("อาหารสุนัข")
    ).toBeInTheDocument();

    expect(
      screen.getByText("฿100")
    ).toBeInTheDocument();
  });

  // Test 3: คำนวณยอดรวม
  it("คำนวณยอดรวมสินค้าได้ถูกต้อง", () => {
    renderCart([
      {
        id: 1,
        name: "อาหารสุนัข",
        price: 100,
        quantity: 2,
        stock: 10,
      },
      {
        id: 2,
        name: "ของเล่นแมว",
        price: 50,
        quantity: 1,
        stock: 5,
      },
    ]);

    expect(
      screen.getByText("฿250")
    ).toBeInTheDocument();
  });

  // Test 4: เพิ่มจำนวนสินค้า
  it("เรียกฟังก์ชันเมื่อกดปุ่มเพิ่มจำนวนสินค้า", () => {
    const { onChangeQty } = renderCart([
      {
        id: 1,
        name: "อาหารสุนัข",
        price: 100,
        quantity: 1,
        stock: 10,
      },
    ]);

    fireEvent.click(screen.getByText("+"));

    expect(onChangeQty).toHaveBeenCalledWith(1, 1);
  });

});
