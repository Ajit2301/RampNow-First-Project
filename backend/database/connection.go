//database/connection.go
package database

import (
    "database/sql"
    "fmt"
    "log"
    "os"
 
    _ "github.com/lib/pq"
    "github.com/joho/godotenv"
)

var DB *sql.DB

func InitDB() {
    err := godotenv.Load()
    if err != nil {
        log.Println("Warning: No .env file found. Proceeding without it.")
    }

    dsn := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        os.Getenv("DB_HOST"),
        os.Getenv("DB_PORT"),
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_NAME"),
    )

    DB, err = sql.Open("postgres", dsn)
    if err != nil {
        log.Fatalf("Failed to connect to DB: %v", err)
    }
    log.Println("Successfully opened connection to DB")
    if err = DB.Ping(); err != nil {
        log.Fatalf("Failed to ping DB: %v", err)
    }

    log.Println("Database connected successfully.")
}
