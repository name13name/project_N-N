
package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"
	"fmt"

	"pawmart/backend/config"

	"golang.org/x/crypto/bcrypt"
)

// ข้อมูลสมาชิก
type AuthUser struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

// ข้อมูลสมัครสมาชิก
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ข้อมูลเข้าสู่ระบบ
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ส่ง JSON กลับไปยัง Frontend
func authJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// สร้าง Token แบบสุ่ม
func generateToken() (string, error) {
	bytes := make([]byte, 32)

	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}

// แปลง Token เป็น Hash
func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

// POST /api/auth/register
func Register(w http.ResponseWriter, r *http.Request) {

	var req RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "ข้อมูลไม่ถูกต้อง",
		})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if req.Name == "" || req.Email == "" || len(req.Password) < 8 {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "กรุณากรอกข้อมูลให้ครบ และรหัสผ่านต้องมีอย่างน้อย 8 ตัว",
		})
		return
	}

	// เข้ารหัสรหัสผ่าน
	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถสร้างรหัสผ่านได้",
		})
		return
	}

	// บันทึกสมาชิก
	var user AuthUser

	err = config.DB.QueryRow(
		r.Context(),
		`INSERT INTO users (name, email, password_hash)
		 VALUES ($1, $2, $3)
		 RETURNING id, name, email, role`,
		req.Name,
		req.Email,
		string(passwordHash),
	).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Role,
	)

	if err != nil {
		authJSON(w, http.StatusConflict, map[string]string{
			"message": "อีเมลนี้ถูกใช้งานแล้ว หรือไม่สามารถสมัครสมาชิกได้",
		})
		return
	}

	// สร้าง Token
	token, err := generateToken()
	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถสร้าง Token ได้",
		})
		return
	}

	expiresAt := time.Now().Add(24 * time.Hour)

	_, err = config.DB.Exec(
		r.Context(),
		`INSERT INTO user_sessions (user_id, token_hash, expires_at)
		 VALUES ($1, $2, $3)`,
		user.ID,
		hashToken(token),
		expiresAt,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถสร้าง Session ได้",
		})
		return
	}

	authJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "สมัครสมาชิกสำเร็จ",
		"token":   token,
		"user":    user,
	})
}

// POST /api/auth/login
func Login(w http.ResponseWriter, r *http.Request) {

	var req LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "ข้อมูลไม่ถูกต้อง",
		})
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	var user AuthUser
	var passwordHash string

	// ค้นหาสมาชิกจากอีเมล
	err := config.DB.QueryRow(
		r.Context(),
		`SELECT id, name, email, role, password_hash
		 FROM users
		 WHERE LOWER(email) = $1`,
		req.Email,
	).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Role,
		&passwordHash,
	)

	if err != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
		})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if bcrypt.CompareHashAndPassword(
		[]byte(passwordHash),
		[]byte(req.Password),
	) != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
		})
		return
	}

	// สร้าง Token
	token, err := generateToken()
	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถสร้าง Token ได้",
		})
		return
	}

	expiresAt := time.Now().Add(24 * time.Hour)

	_, err = config.DB.Exec(
		r.Context(),
		`INSERT INTO user_sessions (user_id, token_hash, expires_at)
		 VALUES ($1, $2, $3)`,
		user.ID,
		hashToken(token),
		expiresAt,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถสร้าง Session ได้",
		})
		return
	}

	authJSON(w, http.StatusOK, map[string]interface{}{
		"message": "เข้าสู่ระบบสำเร็จ",
		"token":   token,
		"user":    user,
	})
}

// GET /api/me
func Me(w http.ResponseWriter, r *http.Request) {

	authHeader := r.Header.Get("Authorization")

	if !strings.HasPrefix(authHeader, "Bearer ") {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "กรุณาเข้าสู่ระบบ",
		})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	var user AuthUser

	// ตรวจสอบ Token จาก Session
	err := config.DB.QueryRow(
		r.Context(),
		`SELECT u.id, u.name, u.email, u.role
		 FROM users u
		 JOIN user_sessions s ON u.id = s.user_id
		 WHERE s.token_hash = $1
		 AND s.expires_at > NOW()`,
		hashToken(token),
	).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Role,
	)

	if err != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "Session หมดอายุหรือไม่ถูกต้อง",
		})
		return
	}

	authJSON(w, http.StatusOK, map[string]interface{}{
		"user": user,
	})
}

// ตรวจสอบ Token และดึง ID สมาชิกที่เข้าสู่ระบบ
func getAuthenticatedUserID(r *http.Request) (int64, error) {
	authHeader := r.Header.Get("Authorization")

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return 0, fmt.Errorf("กรุณาเข้าสู่ระบบ")
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	var userID int64

	err := config.DB.QueryRow(
		r.Context(),
		`SELECT user_id
		 FROM user_sessions
		 WHERE token_hash = $1
		 AND expires_at > NOW()`,
		hashToken(token),
	).Scan(&userID)

	return userID, err
}

// PUT /api/profile
// แก้ไขชื่อและอีเมล
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := getAuthenticatedUserID(r)
	if err != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "กรุณาเข้าสู่ระบบใหม่",
		})
		return
	}

	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "ข้อมูลไม่ถูกต้อง",
		})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if req.Name == "" || req.Email == "" {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "กรุณากรอกชื่อและอีเมลให้ครบ",
		})
		return
	}

	var user AuthUser

	err = config.DB.QueryRow(
		r.Context(),
		`UPDATE users
		 SET name = $1, email = $2
		 WHERE id = $3
		 RETURNING id, name, email, role`,
		req.Name,
		req.Email,
		userID,
	).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Role,
	)

	if err != nil {
		authJSON(w, http.StatusConflict, map[string]string{
			"message": "ไม่สามารถบันทึกข้อมูลได้ อีเมลอาจถูกใช้งานแล้ว",
		})
		return
	}

	authJSON(w, http.StatusOK, map[string]interface{}{
		"message": "บันทึกข้อมูลสำเร็จ",
		"user":    user,
	})
}

// PUT /api/profile/password
// เปลี่ยนรหัสผ่าน
func ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, err := getAuthenticatedUserID(r)
	if err != nil {
		authJSON(w, http.StatusUnauthorized, map[string]string{
			"message": "กรุณาเข้าสู่ระบบใหม่",
		})
		return
	}

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "ข้อมูลไม่ถูกต้อง",
		})
		return
	}

	if len(req.NewPassword) < 8 {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัว",
		})
		return
	}

	var passwordHash string

	err = config.DB.QueryRow(
		r.Context(),
		`SELECT password_hash
		 FROM users
		 WHERE id = $1`,
		userID,
	).Scan(&passwordHash)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถตรวจสอบบัญชีได้",
		})
		return
	}

	if bcrypt.CompareHashAndPassword(
		[]byte(passwordHash),
		[]byte(req.OldPassword),
	) != nil {
		authJSON(w, http.StatusBadRequest, map[string]string{
			"message": "รหัสผ่านเดิมไม่ถูกต้อง",
		})
		return
	}

	newHash, err := bcrypt.GenerateFromPassword(
		[]byte(req.NewPassword),
		bcrypt.DefaultCost,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถเข้ารหัสรหัสผ่านได้",
		})
		return
	}

	_, err = config.DB.Exec(
		r.Context(),
		`UPDATE users
		 SET password_hash = $1
		 WHERE id = $2`,
		string(newHash),
		userID,
	)

	if err != nil {
		authJSON(w, http.StatusInternalServerError, map[string]string{
			"message": "ไม่สามารถเปลี่ยนรหัสผ่านได้",
		})
		return
	}

	authJSON(w, http.StatusOK, map[string]string{
		"message": "เปลี่ยนรหัสผ่านสำเร็จ",
	})
}
