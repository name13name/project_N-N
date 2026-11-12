import { useEffect, useState } from "react";
import API from "../services/api";

export default function Home() {
  const [health, setHealth] = useState("Loading...");

  useEffect(() => {
    API.get("/health")
      .then((res) => setHealth(res.data.message || "Backend Online"))
      .catch(() => setHealth("Backend Offline"));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🐾 ต้อนรับสู่ PawMart</h1>
      <p>สถานะการเชื่อมต่อ Go Backend: <strong>{health}</strong></p>
    </div>
  );
}
