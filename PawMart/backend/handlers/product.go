
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"pawmart/backend/config"
	"pawmart/backend/models"
)

// GET /api/products
// ดึงรายการสินค้าทั้งหมด
func GetProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query(
		r.Context(),
		`SELECT id, name, description, category,
		 pet_type, price, stock, image
		 FROM products
		 ORDER BY id`,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถดึงข้อมูลสินค้าได้",
		})
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
			authJSON(w, http.StatusInternalServerError, map[string]string{
				"message": "ไม่สามารถอ่านข้อมูลสินค้าได้",
			})
			return
		}

		products = append(products, p)
	}

	if err := rows.Err(); err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "เกิดข้อผิดพลาดในการอ่านข้อมูลสินค้า",
		})
		return
	}

	authJSON(w, http.StatusOK, map[string]interface{}{
		"products": products,
	})
}

// GET /api/categories
// ดึงหมวดหมู่สินค้าทั้งหมด
func GetCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query(
		r.Context(),
		`SELECT DISTINCT category
		 FROM products
		 WHERE category IS NOT NULL AND category <> ''
		 ORDER BY category`,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถดึงหมวดหมู่สินค้าได้",
		})
		return
	}
	defer rows.Close()

	type Category struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}

	categories := []Category{}

	for rows.Next() {
		var category string

		if err := rows.Scan(&category); err != nil {
			authJSON(w, http.StatusInternalServerError, map[string]string{
				"message": "ไม่สามารถอ่านหมวดหมู่สินค้าได้",
			})
			return
		}

		categories = append(categories, Category{
			ID:   category,
			Name: category,
		})
	}

	if err := rows.Err(); err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "เกิดข้อผิดพลาดในการอ่านหมวดหมู่",
		})
		return
	}

	authJSON(w, http.StatusOK, map[string]interface{}{
		"categories": categories,
	})
}

// ตรวจสอบว่าเป็น Admin จริงหรือไม่
// ตรวจสอบจาก Token และ role ใน Database
func requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	userID, err := getAuthenticatedUserID(r)

	if err != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "กรุณาเข้าสู่ระบบใหม่",
		})
		return false
	}

	var role string

	err = config.DB.QueryRow(
		r.Context(),
		`SELECT role FROM users WHERE id = $1`,
		userID,
	).Scan(&role)

	if err != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "ไม่พบบัญชีผู้ใช้งาน",
		})
		return false
	}

	if role != "admin" {
		authJSON(w, http.StatusForbidden, map[string]string{
			"message": "คุณไม่มีสิทธิ์จัดการสินค้า",
		})
		return false
	}

	return true
}

// ข้อมูลที่ใช้เพิ่มและแก้ไขสินค้า
type ProductRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	PetType     string  `json:"pet_type"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	Image       string  `json:"image"`
}

// ตรวจสอบข้อมูลสินค้า
func validateProduct(req *ProductRequest) bool {
	req.Name = strings.TrimSpace(req.Name)
	req.Description = strings.TrimSpace(req.Description)
	req.Category = strings.TrimSpace(req.Category)
	req.PetType = strings.TrimSpace(req.PetType)
	req.Image = strings.TrimSpace(req.Image)

	return req.Name != "" &&
		req.Category != "" &&
		req.PetType != "" &&
		req.Price >= 0 &&
		req.Stock >= 0
}

// POST /api/admin/products
// เพิ่มสินค้าใหม่
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}

	var req ProductRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "ข้อมูลสินค้าไม่ถูกต้อง",
		})
		return
	}

	if !validateProduct(&req) {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "กรุณากรอกชื่อ หมวดหมู่ ประเภทสัตว์ และตรวจสอบราคา/สต็อก",
		})
		return
	}

	var product models.Product

	err := config.DB.QueryRow(
		r.Context(),
		`INSERT INTO products
		 (name, description, category, pet_type, price, stock, image)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, name, description, category,
		 pet_type, price, stock, image`,
		req.Name,
		req.Description,
		req.Category,
		req.PetType,
		req.Price,
		req.Stock,
		req.Image,
	).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Category,
		&product.PetType,
		&product.Price,
		&product.Stock,
		&product.Image,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถเพิ่มสินค้าได้",
		})
		return
	}

	authJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "เพิ่มสินค้าสำเร็จ",
		"product": product,
	})
}

// PUT /api/admin/products/{id}
// แก้ไขสินค้า
func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil || id <= 0 {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "รหัสสินค้าไม่ถูกต้อง",
		})
		return
	}

	var req ProductRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "ข้อมูลสินค้าไม่ถูกต้อง",
		})
		return
	}

	if !validateProduct(&req) {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "กรุณากรอกชื่อ หมวดหมู่ ประเภทสัตว์ และตรวจสอบราคา/สต็อก",
		})
		return
	}

	var product models.Product

	err = config.DB.QueryRow(
		r.Context(),
		`UPDATE products
		 SET name = $1,
		     description = $2,
		     category = $3,
		     pet_type = $4,
		     price = $5,
		     stock = $6,
		     image = $7
		 WHERE id = $8
		 RETURNING id, name, description, category,
		 pet_type, price, stock, image`,
		req.Name,
		req.Description,
		req.Category,
		req.PetType,
		req.Price,
		req.Stock,
		req.Image,
		id,
	).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Category,
		&product.PetType,
		&product.Price,
		&product.Stock,
		&product.Image,
	)

	if err != nil {
		authJSON(w, http.StatusNotFound, map[string]string{
			"message": "ไม่พบสินค้าที่ต้องการแก้ไข",
		})
		return
	}

	authJSON(w, http.StatusOK, map[string]interface{}{
		"message": "แก้ไขสินค้าสำเร็จ",
		"product": product,
	})
}

// DELETE /api/admin/products/{id}
// ลบสินค้า
func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil || id <= 0 {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "รหัสสินค้าไม่ถูกต้อง",
		})
		return
	}

	result, err := config.DB.Exec(
		r.Context(),
		`DELETE FROM products WHERE id = $1`,
		id,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถลบสินค้าได้ อาจมีคำสั่งซื้ออ้างอิงสินค้านี้อยู่",
		})
		return
	}

	if result.RowsAffected() == 0 {
		authJSON(w, http.StatusNotFound, map[string]string{
			"message": "ไม่พบสินค้าที่ต้องการลบ",
		})
		return
	}

	authJSON(w, http.StatusOK, map[string]string{
		"message": "ลบสินค้าสำเร็จ",
	})
}
