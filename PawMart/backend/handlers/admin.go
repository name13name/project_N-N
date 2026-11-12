package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pawmart/backend/config"
)

// ข้อมูลคำสั่งซื้อสำหรับหน้า Admin
type AdminOrder struct {
	ID        int64           `json:"id"`
	UserID    int64           `json:"user_id"`
	UserName  string          `json:"user_name"`
	UserEmail string          `json:"user_email"`
	Address   string          `json:"address"`
	Phone     string          `json:"phone"`
	Total     float64         `json:"total"`
	Status    string          `json:"status"`
	CreatedAt time.Time       `json:"created_at"`
	Items     json.RawMessage `json:"items"`
}

// GET /api/admin/orders
// ดึงคำสั่งซื้อทั้งหมดของสมาชิก
func GetAdminOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query(r.Context(), `
		SELECT
			o.id,
			o.user_id,
			u.name,
			u.email,
			o.address,
			o.phone,
			o.total,
			o.status,
			o.created_at
		FROM orders o
		LEFT JOIN users u ON o.user_id = u.id
		ORDER BY o.created_at DESC
	`)

	if err != nil {
		http.Error(w, "ไม่สามารถดึงคำสั่งซื้อได้", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	orders := []AdminOrder{}

	for rows.Next() {
		var order AdminOrder

		err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.UserName,
			&order.UserEmail,
			&order.Address,
			&order.Phone,
			&order.Total,
			&order.Status,
			&order.CreatedAt,
		)

		if err != nil {
			http.Error(w, "อ่านข้อมูลคำสั่งซื้อไม่สำเร็จ", http.StatusInternalServerError)
			return
		}

		orders = append(orders, order)
	}

	if rows.Err() != nil {
		http.Error(w, "อ่านข้อมูลคำสั่งซื้อไม่สำเร็จ", http.StatusInternalServerError)
		return
	}

	// ดึงรายการสินค้าในแต่ละคำสั่งซื้อ
	for i := range orders {
		itemRows, err := config.DB.Query(r.Context(), `
			SELECT
				product_id,
				product_name,
				price,
				quantity,
				subtotal
			FROM order_items
			WHERE order_id = $1
			ORDER BY id
		`, orders[i].ID)

		if err != nil {
			http.Error(w, "ไม่สามารถดึงรายการสินค้าได้", http.StatusInternalServerError)
			return
		}

		type OrderItem struct {
			ProductID   int64   `json:"product_id"`
			ProductName string  `json:"product_name"`
			Price       float64 `json:"price"`
			Quantity    int     `json:"quantity"`
			Subtotal    float64 `json:"subtotal"`
		}

		items := []OrderItem{}

		for itemRows.Next() {
			var item OrderItem

			if err := itemRows.Scan(
				&item.ProductID,
				&item.ProductName,
				&item.Price,
				&item.Quantity,
				&item.Subtotal,
			); err != nil {
				itemRows.Close()
				http.Error(w, "อ่านรายการสินค้าไม่สำเร็จ", http.StatusInternalServerError)
				return
			}

			items = append(items, item)
		}

		if itemRows.Err() != nil {
			itemRows.Close()
			http.Error(w, "อ่านรายการสินค้าไม่สำเร็จ", http.StatusInternalServerError)
			return
		}

		itemRows.Close()

		itemJSON, err := json.Marshal(items)
		if err != nil {
			http.Error(w, "แปลงรายการสินค้าไม่สำเร็จ", http.StatusInternalServerError)
			return
		}

		orders[i].Items = itemJSON
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"orders": orders,
	})
}

// PUT /api/admin/orders/{id}/status
// เปลี่ยนสถานะคำสั่งซื้อ
func UpdateAdminOrderStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		http.Error(w, "รหัสคำสั่งซื้อไม่ถูกต้อง", http.StatusBadRequest)
		return
	}

	var request struct {
		Status string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "ข้อมูลที่ส่งมาไม่ถูกต้อง", http.StatusBadRequest)
		return
	}

	request.Status = strings.TrimSpace(request.Status)

	allowedStatuses := map[string]bool{
		"pending":    true,
		"processing": true,
		"shipped":    true,
		"delivered":  true,
		"cancelled":  true,
	}

	if !allowedStatuses[request.Status] {
		http.Error(w, "สถานะคำสั่งซื้อไม่ถูกต้อง", http.StatusBadRequest)
		return
	}

	var updatedID int64

	err = config.DB.QueryRow(r.Context(), `
		UPDATE orders
		SET status = $1
		WHERE id = $2
		RETURNING id
	`, request.Status, id).Scan(&updatedID)

	if err != nil {
		http.Error(w, "ไม่พบคำสั่งซื้อหรือไม่สามารถเปลี่ยนสถานะได้", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "อัปเดตสถานะคำสั่งซื้อสำเร็จ",
		"id":      updatedID,
		"status":  request.Status,
	})
}

// GET /api/admin/users
// ดึงรายชื่อสมาชิกทั้งหมด โดยไม่ส่ง password_hash กลับไป
func GetAdminUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query(r.Context(), `
		SELECT id, name, email, role, created_at
		FROM users
		ORDER BY created_at DESC
	`)

	if err != nil {
		http.Error(w, "ไม่สามารถดึงข้อมูลสมาชิกได้", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type AdminUser struct {
		ID        int64     `json:"id"`
		Name      string    `json:"name"`
		Email     string    `json:"email"`
		Role      string    `json:"role"`
		CreatedAt time.Time `json:"created_at"`
	}

	users := []AdminUser{}

	for rows.Next() {
		var user AdminUser

		if err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.Role,
			&user.CreatedAt,
		); err != nil {
			http.Error(w, "อ่านข้อมูลสมาชิกไม่สำเร็จ", http.StatusInternalServerError)
			return
		}

		users = append(users, user)
	}

	if rows.Err() != nil {
		http.Error(w, "อ่านข้อมูลสมาชิกไม่สำเร็จ", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users": users,
	})
}