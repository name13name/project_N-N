
import axios from "axios";

// สร้างตัวเชื่อมต่อ Backend
const API = axios.create({
  baseURL: "http://localhost:8080/api",
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
