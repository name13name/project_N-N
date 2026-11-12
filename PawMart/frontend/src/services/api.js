
import axios from "axios";

// ใช้ URL จาก Environment Variable
// ถ้าไม่มี ให้ใช้ localhost ตอนพัฒนา
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// แนบ Token ไปกับทุก Request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("pawmart_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// รองรับรูปแบบเรียก API แบบเดิม
export async function api(url, options = {}) {
  const response = await API.request({
    url,
    method: options.method || "GET",
    data: options.body,
    headers: options.headers || {},
  });

  return response.data;
}

// รองรับการเรียกแบบ Axios
export default API;
