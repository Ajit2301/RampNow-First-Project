package database

import (
	"database/sql"
	"log"
	"os"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	var err error
	dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        panic("DATABASE_URL environment variable not set")
    }
	DB, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("Database connection is not alive:", err)
	}

	log.Println("Connected to the database successfully!")
	// Log the environment variables to verify they're loaded
	log.Println("Database URL:", os.Getenv("DATABASE_URL"))
	log.Println("Admin Email:", os.Getenv("ADMIN_EMAIL"))
	log.Println("Secret Key:", os.Getenv("SECRET_KEY"))
}
