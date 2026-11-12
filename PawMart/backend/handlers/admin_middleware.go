
package handlers

import (
	"encoding/json"
	"net/http"

	"pawmart/backend/config"
)

// RequireAdmin ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่
func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// 1. ตรวจสอบ Token และ Session
		userID, err := getAuthenticatedUserID(r)
		if err != nil {
			writeAdminError(w, http.StatusUnauthorized,
				"กรุณาเข้าสู่ระบบก่อนใช้งาน")
			return
		}

		// 2. ตรวจสอบ Role จาก Database
		var role string

		err = config.DB.QueryRow(
			r.Context(),
			`SELECT role FROM users WHERE id = $1`,
			userID,
		).Scan(&role)

		if err != nil {
			writeAdminError(w, http.StatusUnauthorized,
				"ไม่พบข้อมูลผู้ใช้งาน")
			return
		}

		// 3. ถ้าไม่ใช่ Admin ให้ปฏิเสธ
		if role != "admin" {
			writeAdminError(w, http.StatusForbidden,
				"คุณไม่มีสิทธิ์เข้าใช้งานส่วนผู้ดูแลระบบ")
			return
		}

		// 4. ถ้าเป็น Admin ให้ทำงานต่อ
		next.ServeHTTP(w, r)
	})
}

// ส่งข้อความ Error กลับเป็น JSON
func writeAdminError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}
