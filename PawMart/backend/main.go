
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

	// โหลดไฟล์ .env จากโฟลเดอร์ PawMart
	err := godotenv.Load("../.env")

	if err != nil {
		log.Fatal("Cannot load .env:", err)
	}

	// เชื่อมต่อ Database
	err = config.ConnectDatabase()

	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer config.DB.Close()

	// กำหนด Routes
	mux := routes.SetupRoutes()

	// เปิดใช้งาน CORS
	handler := middleware.CORS(mux)

	// กำหนด Port
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	fmt.Println("PawMart Backend running on port", port)

	err = http.ListenAndServe(":"+port, handler)

	if err != nil {
		log.Fatal(err)
	}
}
