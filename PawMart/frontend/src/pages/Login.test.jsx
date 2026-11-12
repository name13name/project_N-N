
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act
} from "@testing-library/react";

import {
  MemoryRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Login from "./Login";
import { useAuth } from "../context/AuthContext";

// จำลองระบบ Auth
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// ใช้ตรวจสอบหน้าที่ระบบนำทางไป
function LocationDisplay() {
  const location = useLocation();

  return (
    <p>หน้าปัจจุบัน: {location.pathname}</p>
  );
}

// ฟังก์ชันช่วยแสดงหน้า Login
function renderLogin(login, initialEntries = ["/login"]) {
  useAuth.mockReturnValue({ login });

  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  );
}

// ชุดทดสอบหน้า Login
describe("Login Unit Test", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: แสดงฟอร์ม Login
  it("แสดงช่องกรอกอีเมลและรหัสผ่าน", () => {
    renderLogin(vi.fn());

    expect(
      screen.getByRole("heading", { name: "เข้าสู่ระบบ" })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("กรอกอีเมล")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("กรอกรหัสผ่าน")
    ).toBeInTheDocument();
  });

  // Test 2: สมาชิกเข้าสู่ระบบสำเร็จ
  it("นำสมาชิกไปยังหน้าแรกเมื่อเข้าสู่ระบบสำเร็จ", async () => {
    const login = vi.fn().mockResolvedValue({
      role: "member",
    });

    renderLogin(login);

    fireEvent.change(
      screen.getByPlaceholderText("กรอกอีเมล"),
      { target: { value: "member@test.com" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("กรอกรหัสผ่าน"),
      { target: { value: "123456" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "เข้าสู่ระบบ" })
    );

    await waitFor(() => {
      expect(
        screen.getByText("หน้าปัจจุบัน: /")
      ).toBeInTheDocument();
    });

    expect(login).toHaveBeenCalledWith(
      "member@test.com",
      "123456"
    );
  });

  // Test 3: Admin เข้าสู่ระบบสำเร็จ
  it("นำ Admin ไปยังหน้า Dashboard", async () => {
    const login = vi.fn().mockResolvedValue({
      role: "admin",
    });

    renderLogin(login);

    fireEvent.change(
      screen.getByPlaceholderText("กรอกอีเมล"),
      { target: { value: "admin@test.com" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("กรอกรหัสผ่าน"),
      { target: { value: "123456" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "เข้าสู่ระบบ" })
    );

    await waitFor(() => {
      expect(
        screen.getByText("หน้าปัจจุบัน: /admin/dashboard")
      ).toBeInTheDocument();
    });
  });

  // Test 4: เข้าสู่ระบบไม่สำเร็จ
  it("แสดงข้อความเมื่อเข้าสู่ระบบไม่สำเร็จ", async () => {
    const login = vi.fn().mockRejectedValue(
      new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    );

    renderLogin(login);

    fireEvent.change(
      screen.getByPlaceholderText("กรอกอีเมล"),
      { target: { value: "wrong@test.com" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("กรอกรหัสผ่าน"),
      { target: { value: "wrongpassword" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "เข้าสู่ระบบ" })
    );

    expect(
      await screen.findByText("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    ).toBeInTheDocument();
  });

  // Test 5: แสดงสถานะกำลังเข้าสู่ระบบ
  it("แสดงข้อความระหว่างรอการเข้าสู่ระบบ", async () => {
    let resolveLogin;

    const login = vi.fn().mockImplementation(
      () => new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );

    renderLogin(login);

    fireEvent.change(
      screen.getByPlaceholderText("กรอกอีเมล"),
      { target: { value: "member@test.com" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("กรอกรหัสผ่าน"),
      { target: { value: "123456" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "เข้าสู่ระบบ" })
    );

    expect(
      await screen.findByRole("button", {
        name: "กำลังเข้าสู่ระบบ...",
      })
    ).toBeDisabled();

    // จำลองผลการเข้าสู่ระบบสำเร็จ
    await act(async () => {
      resolveLogin({ role: "member" });
    });
  });

});
