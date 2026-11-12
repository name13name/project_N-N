
package handlers

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"time"

	"pawmart/backend/config"
)

// ข้อมูลที่ Frontend ส่งมาตอนยืนยันคำสั่งซื้อ
type CreateOrderRequest struct {
	Address string `json:"address"`
	Phone   string `json:"phone"`
	Items   []struct {
		ProductID int64 `json:"product_id"`
		Quantity  int   `json:"quantity"`
	} `json:"items"`
}

// ข้อมูลสินค้าในคำสั่งซื้อ
type orderProduct struct {
	ID       int64
	Name     string
	Price    float64
	Stock    int
	Quantity int
}

// POST /api/orders
// สร้างคำสั่งซื้อใหม่
func CreateOrder(w http.ResponseWriter, r *http.Request) {

	// ตรวจสอบ Token
	authHeader := r.Header.Get("Authorization")

	if !strings.HasPrefix(authHeader, "Bearer ") {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ",
		})
		return
	}

	token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))

	if token == "" {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "Token ไม่ถูกต้อง",
		})
		return
	}

	// ตรวจสอบสมาชิกจาก Token และ Session
	var userID int64

	err := config.DB.QueryRow(
		r.Context(),
		`SELECT u.id
		 FROM users u
		 JOIN user_sessions s ON u.id = s.user_id
		 WHERE s.token_hash = $1
		   AND s.expires_at > NOW()`,
		hashToken(token),
	).Scan(&userID)

	if err != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
		})
		return
	}

	// อ่านข้อมูลจาก Frontend
	var req CreateOrderRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "ข้อมูลคำสั่งซื้อไม่ถูกต้อง",
		})
		return
	}

	req.Address = strings.TrimSpace(req.Address)
	req.Phone = strings.TrimSpace(req.Phone)

	if req.Address == "" || req.Phone == "" || len(req.Items) == 0 {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "กรุณากรอกที่อยู่ เบอร์โทรศัพท์ และเลือกสินค้า",
		})
		return
	}

	if len(req.Address) > 1000 || len(req.Phone) > 20 {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "ที่อยู่หรือเบอร์โทรศัพท์ยาวเกินไป",
		})
		return
	}

	// รวมสินค้าที่มี ID ซ้ำกัน
	quantities := make(map[int64]int)

	for _, item := range req.Items {
		if item.ProductID <= 0 || item.Quantity <= 0 {
			authJSON(w, http.StatusBadRequest, map[string]string{
				"message": "ข้อมูลสินค้าไม่ถูกต้อง",
			})
			return
		}

		quantities[item.ProductID] += item.Quantity
	}

	// เรียง ID เพื่อให้ล็อกสินค้าเป็นลำดับเดียวกัน
	productIDs := make([]int64, 0, len(quantities))

	for id := range quantities {
		productIDs = append(productIDs, id)
	}

	sort.Slice(productIDs, func(i, j int) bool {
		return productIDs[i] < productIDs[j]
	})

	// เริ่ม Transaction
	tx, err := config.DB.Begin(r.Context())

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถเริ่มทำรายการสั่งซื้อได้",
		})
		return
	}

	defer tx.Rollback(r.Context())

	var products []orderProduct
	var total float64

	// ตรวจสอบสินค้าและ Stock ในฐานข้อมูล
	for _, productID := range productIDs {

		var p orderProduct

		err := tx.QueryRow(
			r.Context(),
			`SELECT id, name, price, stock
			 FROM products
			 WHERE id = $1
			 FOR UPDATE`,
			productID,
		).Scan(
			&p.ID,
			&p.Name,
			&p.Price,
			&p.Stock,
		)

		if err != nil {
			authJSON(w, http.StatusBadRequest, map[string]string{
				"message": "ไม่พบสินค้าบางรายการในระบบ",
			})
			return
		}

		p.Quantity = quantities[productID]

		if p.Stock < p.Quantity {
			authJSON(w, http.StatusBadRequest, map[string]string{
				"message": "สินค้า " + p.Name + " มีจำนวนไม่เพียงพอ",
			})
			return
		}

		if p.Price < 0 {
			authJSON(w, http.StatusInternalServerError, map[string]string{
				"message": "ราคาสินค้าไม่ถูกต้อง",
			})
			return
		}

		total += p.Price * float64(p.Quantity)
		products = append(products, p)
	}

	// บันทึกคำสั่งซื้อหลัก
	var orderID int64

	err = tx.QueryRow(
		r.Context(),
		`INSERT INTO orders (user_id, address, phone, total, status)
		 VALUES ($1, $2, $3, $4, 'pending')
		 RETURNING id`,
		userID,
		req.Address,
		req.Phone,
		total,
	).Scan(&orderID)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถบันทึกคำสั่งซื้อได้",
		})
		return
	}

	// บันทึกรายการสินค้าและตัด Stock
	for _, p := range products {

		subtotal := p.Price * float64(p.Quantity)

		_, err = tx.Exec(
			r.Context(),
			`INSERT INTO order_items
			 (order_id, product_id, product_name, price, quantity, subtotal)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			orderID,
			p.ID,
			p.Name,
			p.Price,
			p.Quantity,
			subtotal,
		)

		if err != nil {
			authJSON(w, http.StatusInternalServerError, map[string]string{
				"message": "ไม่สามารถบันทึกรายการสินค้าได้",
			})
			return
		}

		_, err = tx.Exec(
			r.Context(),
			`UPDATE products
			 SET stock = stock - $1
			 WHERE id = $2`,
			p.Quantity,
			p.ID,
		)

		if err != nil {
			authJSON(w, http.StatusInternalServerError, map[string]string{
				"message": "ไม่สามารถปรับปรุง Stock ได้",
			})
			return
		}
	}

	// ยืนยัน Transaction
	if err := tx.Commit(r.Context()); err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถยืนยันคำสั่งซื้อได้",
		})
		return
	}

	// ส่งผลลัพธ์กลับไป Frontend
	authJSON(w, http.StatusCreated, map[string]interface{}{
		"message":  "สั่งซื้อสินค้าสำเร็จ",
		"order_id": orderID,
		"total":    total,
		"status":   "pending",
	})
}

// GET /api/orders
// ดึงประวัติคำสั่งซื้อพร้อมรายการสินค้า
func GetOrders(w http.ResponseWriter, r *http.Request) {

	// ตรวจสอบ Token
	authHeader := r.Header.Get("Authorization")

	if !strings.HasPrefix(authHeader, "Bearer ") {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "กรุณาเข้าสู่ระบบ",
		})
		return
	}

	token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))

	if token == "" {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "Token ไม่ถูกต้อง",
		})
		return
	}

	// ตรวจสอบ Session
	var userID int64

	err := config.DB.QueryRow(
		r.Context(),
		`SELECT user_id
		 FROM user_sessions
		 WHERE token_hash = $1
		   AND expires_at > CURRENT_TIMESTAMP`,
		hashToken(token),
	).Scan(&userID)

	if err != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
		})
		return
	}

	// โครงสร้างรายการสินค้า
	type OrderItem struct {
		ProductID   int64   `json:"product_id"`
		ProductName string  `json:"product_name"`
		Price       float64 `json:"price"`
		Quantity    int     `json:"quantity"`
		Subtotal    float64 `json:"subtotal"`
	}

	// โครงสร้างคำสั่งซื้อ
	type Order struct {
		ID        int64       `json:"id"`
		Total     float64     `json:"total"`
		Status    string      `json:"status"`
		CreatedAt time.Time   `json:"created_at"`
		Address   string      `json:"address"`
		Phone     string      `json:"phone"`
		Items     []OrderItem `json:"items"`
	}

	// ดึงคำสั่งซื้อพร้อมรายการสินค้า
	rows, err := config.DB.Query(
		r.Context(),
		`SELECT
			o.id,
			o.total,
			o.status,
			o.created_at,
			o.address,
			o.phone,
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'product_id', oi.product_id,
							'product_name', oi.product_name,
							'price', oi.price,
							'quantity', oi.quantity,
							'subtotal', oi.subtotal
						)
					)
					FROM order_items oi
					WHERE oi.order_id = o.id
				),
				'[]'::json
			)
		 FROM orders o
		 WHERE o.user_id = $1
		 ORDER BY o.created_at DESC`,
		userID,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถดึงประวัติคำสั่งซื้อได้",
		})
		return
	}

	defer rows.Close()

	orders := []Order{}

	for rows.Next() {
		var order Order
		var itemsJSON []byte

		err := rows.Scan(
			&order.ID,
			&order.Total,
			&order.Status,
			&order.CreatedAt,
			&order.Address,
			&order.Phone,
			&itemsJSON,
		)

		if err != nil {
			authJSON(w, http.StatusInternalServerError, map[string]string{
				"message": "อ่านข้อมูลคำสั่งซื้อไม่สำเร็จ",
			})
			return
		}

		if err := json.Unmarshal(itemsJSON, &order.Items); err != nil {
			authJSON(w, http.StatusInternalServerError, map[string]string{
				"message": "อ่านรายการสินค้าไม่สำเร็จ",
			})
			return
		}

		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "เกิดข้อผิดพลาดในการอ่านข้อมูล",
		})
		return
	}

	// ส่งข้อมูลกลับไป Frontend
	authJSON(w, http.StatusOK, map[string]interface{}{
		"orders": orders,
	})
}
