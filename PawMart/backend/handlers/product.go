package handlers

import (
	"encoding/json"
	"net/http"

	"pawmart/backend/config"
	"pawmart/backend/models"
)

// GET /api/products
// ดึงสินค้าทั้งหมดจาก Database
func GetProducts(w http.ResponseWriter, r *http.Request) {

	rows, err := config.DB.Query(
		r.Context(),
		`SELECT id, name, description, category,
		pet_type, price, stock, image
		FROM products ORDER BY id`,
	)

	if err != nil {
		http.Error(w, "Cannot get products", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	products := []models.Product{}

	for rows.Next() {

		var p models.Product

		err := rows.Scan(
			&p.ID,
			&p.Name,
			&p.Description,
			&p.Category,
			&p.PetType,
			&p.Price,
			&p.Stock,
			&p.Image,
		)

		if err != nil {
			http.Error(w, "Cannot read product", http.StatusInternalServerError)
			return
		}

		products = append(products, p)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}