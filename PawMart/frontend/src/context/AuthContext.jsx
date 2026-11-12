
import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบ Token เมื่อเปิดเว็บไซต์
  useEffect(() => {
    const token = localStorage.getItem("pawmart_token");

    if (!token) {
      setLoading(false);
      return;
    }

    API.get("/me")
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem("pawmart_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // เข้าสู่ระบบสมาชิก
  async function login(email, password) {
    const response = await API.post("/auth/login", {
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem("pawmart_token", data.token);
    setUser(data.user);

    return data.user;
  }

  // เข้าสู่ระบบ Admin
  async function loginAdmin(email, password) {
    const response = await API.post("/auth/login", {
      email,
      password,
    });

    const data = response.data;

    // ตรวจสอบสิทธิ์ก่อนบันทึก Token
    if (data.user.role !== "admin") {
      throw new Error("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบ Admin");
    }

    // บันทึก Token เฉพาะบัญชี Admin
    localStorage.setItem("pawmart_token", data.token);
    setUser(data.user);

    return data.user;
  }

  // สมัครสมาชิก
  async function register(name, email, password) {
    const response = await API.post("/auth/register", {
      name,
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem("pawmart_token", data.token);
    setUser(data.user);

    return data.user;
  }

  // อัปเดตข้อมูลสมาชิกหลังแก้ไขโปรไฟล์
  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  // ออกจากระบบ
  function logout() {
    localStorage.removeItem("pawmart_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAdmin,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
