package routes

import (
	"net/http"

	"pawmart/backend/handlers"
)

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// สินค้าสำหรับสมาชิกทั่วไป
	mux.HandleFunc("GET /api/products", handlers.GetProducts)
	mux.HandleFunc("GET /api/categories", handlers.GetCategories)

	// ระบบสมาชิก
	mux.HandleFunc("POST /api/auth/register", handlers.Register)
	mux.HandleFunc("POST /api/auth/login", handlers.Login)
	mux.HandleFunc("GET /api/me", handlers.Me)

	// โปรไฟล์
	mux.HandleFunc("GET /api/profile", handlers.Me)
	mux.HandleFunc("PUT /api/profile", handlers.UpdateProfile)
	mux.HandleFunc("PUT /api/profile/password", handlers.ChangePassword)

	// คำสั่งซื้อของสมาชิก (ดูได้เฉพาะของตัวเอง)
	mux.HandleFunc("POST /api/orders", handlers.CreateOrder)
	mux.HandleFunc("GET /api/orders", handlers.GetOrders)

	// จัดการสินค้าสำหรับ Admin
	mux.Handle("POST /api/admin/products",
		handlers.RequireAdmin(http.HandlerFunc(handlers.CreateProduct)))

	mux.Handle("PUT /api/admin/products/{id}",
		handlers.RequireAdmin(http.HandlerFunc(handlers.UpdateProduct)))

	mux.Handle("DELETE /api/admin/products/{id}",
		handlers.RequireAdmin(http.HandlerFunc(handlers.DeleteProduct)))

	// จัดการคำสั่งซื้อสำหรับ Admin
	mux.Handle("GET /api/admin/orders",
		handlers.RequireAdmin(http.HandlerFunc(handlers.GetAdminOrders)))

	mux.Handle("PUT /api/admin/orders/{id}/status",
		handlers.RequireAdmin(http.HandlerFunc(handlers.UpdateAdminOrderStatus)))

	// จัดการสมาชิกสำหรับ Admin
	mux.Handle("GET /api/admin/users",
		handlers.RequireAdmin(http.HandlerFunc(handlers.GetAdminUsers)))

	return mux
}