
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"pawmart/backend/config"
	"pawmart/backend/middleware"
	"pawmart/backend/routes"
)

func main() {
	// โหลด .env สำหรับตอนพัฒนาในเครื่อง
	// ถ้าไม่มีไฟล์ก็ไม่ต้องหยุดโปรแกรม
	_ = godotenv.Load("../.env")

	// ตรวจสอบ DATABASE_URL
	if os.Getenv("DATABASE_URL") == "" {
		log.Fatal("DATABASE_URL is empty")
	}

	log.Println("DATABASE_URL loaded successfully")

	// เชื่อมต่อ Database
	err := config.ConnectDatabase()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer config.DB.Close()

	// กำหนด Routes
	mux := routes.SetupRoutes()

	// เปิดใช้งาน CORS
	handler := middleware.CORS(mux)

	// ใช้ PORT จาก Render หรือใช้ 8080 ตอนพัฒนา
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("PawMart Backend running on port", port)

	// เปิด Server
	err = http.ListenAndServe(":"+port, handler)
	if err != nil {
		log.Fatal(err)
	}
}
