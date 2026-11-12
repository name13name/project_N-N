
import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบว่ามีผู้ใช้เข้าสู่ระบบอยู่หรือไม่
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

  // เข้าสู่ระบบ
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

  // ออกจากระบบ
  function logout() {
    localStorage.removeItem("pawmart_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
