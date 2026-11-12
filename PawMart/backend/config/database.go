package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ตัวแปรเก็บการเชื่อมต่อ Database
var DB *pgxpool.Pool

// ฟังก์ชันเชื่อมต่อ PostgreSQL
func ConnectDatabase() error {

	// อ่าน URL จาก Environment Variable
	databaseURL := os.Getenv("DATABASE_URL")

	if databaseURL == "" {
		return fmt.Errorf("DATABASE_URL is not set")
	}

	// ตั้งค่าการเชื่อมต่อ
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return err
	}

	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnLifetime = time.Hour

	// สร้าง Connection Pool
	DB, err = pgxpool.NewWithConfig(
		context.Background(),
		config,
	)

	if err != nil {
		return err
	}

	// ทดสอบการเชื่อมต่อ
	err = DB.Ping(context.Background())

	if err != nil {
		DB.Close()
		return err
	}

	fmt.Println("Connected to PostgreSQL!")

	return nil
}