package routes

import (
	"net/http"

	"pawmart/backend/handlers"
)

func SetupRoutes() *http.ServeMux {

	mux := http.NewServeMux()

	// Product API
	mux.HandleFunc("GET /api/products", handlers.GetProducts)

	return mux
}