package controllers

import (
	"admin-dashboard/database" // Replace with your actual package for database connection
	"github.com/joho/godotenv"
    "regexp"
	"errors"
	"golang.org/x/crypto/bcrypt"
	"os"
	"log"
)

func validatePassword(password string) error {
    // Check minimum length
    if len(password) < 8 {
        return errors.New("password must be at least 8 characters long")
    }

    // Check for at least one number
    if match, _ := regexp.MatchString(`[0-9]`, password); !match {
        return errors.New("password must contain at least one number")
    }

    // Check for at least one special character
    if match, _ := regexp.MatchString(`[!@#$%^&*]`, password); !match {
        return errors.New("password must contain at least one special character (!@#$%^&*)")
    }

    return nil
}


func RegisterAdmin() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file:", err)
		return
	}

	// Get admin credentials from .env
	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPassword := os.Getenv("ADMIN_PASSWORD")

	if adminEmail == "" || adminPassword == "" {
		log.Println("Admin email or password not provided in .env")
		return
	}

	// Validate password
    if err := validatePassword(adminPassword); err != nil {
        log.Fatalf("Error validating admin password: %s", err)
    }

	// Check if the admin already exists
	var exists bool
	err = database.DB.QueryRow("SELECT EXISTS (SELECT 1 FROM credentials WHERE email = $1)", adminEmail).Scan(&exists)
	if err != nil {
		log.Println("Error checking admin existence:", err)
		return
	}

	if exists {
		log.Println("Admin already exists. Skipping registration.")
		return
	}

	// Hash the admin password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing admin password:", err)
		return
	}

	// Insert admin into the database
	_, err = database.DB.Exec("INSERT INTO credentials (email, password_hash) VALUES ($1, $2)", adminEmail, string(hashedPassword))
	if err != nil {
		log.Println("Error registering admin:", err)
		return
	}

	log.Println("Admin registered successfully")
}