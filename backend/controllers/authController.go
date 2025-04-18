package controllers

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	"admin-dashboard/database"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv" // Import godotenv package
	"golang.org/x/crypto/bcrypt"
)

// Define a struct to hold user login data (email and password)
type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// User struct for storing user data from DB (for authentication)
type User struct {
	ID           int    `json:"id"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
}

// Load environment variables from the .env file
func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

// Function to retrieve user by email from the database
func getUserByEmail(email string) (*User, error) {
	var user User
	// Query the database to find the user by email
	err := database.DB.QueryRow("SELECT id, email, password_hash FROM credentials WHERE email = $1", email).Scan(&user.ID, &user.Email, &user.PasswordHash)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// RegisterUserInput struct to bind input data for user registration
type RegisterUserInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Function to register a user
func RegisterUser(c *gin.Context) {
	var input RegisterUserInput

	// Parse the incoming JSON request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	// Check if the email is "admin@gmail.com"
	if input.Email == "admin@gmail.com" {
		c.JSON(403, gin.H{"error": "Registration using admin@gmail.com is not allowed"})
		return
	}

	// Hash the password using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error hashing the password"})
		return
	}

	// Save the user with hashed password to the database
	_, err = database.DB.Exec("INSERT INTO credentials (email, password_hash) VALUES ($1, $2)", input.Email, string(hashedPassword))
	if err != nil {
		c.JSON(500, gin.H{"error": "Error inserting user into the database"})
		return
	}

	// Respond with success
	c.JSON(200, gin.H{"message": "User registered successfully"})
}

// Check if the email already exists in the database
func CheckEmail(c *gin.Context) {
	var input struct {
		Email string `json:"email"`
	}

	// Parse the incoming JSON request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	// Query to check if email exists in the credentials table
	var exists bool
	err := database.DB.QueryRow("SELECT EXISTS (SELECT 1 FROM credentials WHERE email = $1)", input.Email).Scan(&exists)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error checking email"})
		return
	}

	// Return whether the email exists
	c.JSON(200, gin.H{"exists": exists})
}

// Check if the email already exists in the users table
func CheckEmailExists(c *gin.Context) {
	var input struct {
		Email string `json:"email"`
	}

	// Parse the incoming JSON request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	// Query to check if email exists in the database
	var exists bool
	err := database.DB.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)", input.Email).Scan(&exists)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error checking email"})
		return
	}

	// Return whether the email exists
	c.JSON(200, gin.H{"exists": exists})
}

// Function to change user password
func ChangePassword(c *gin.Context) {
	var input struct {
		OldPassword string `json:"oldPassword"`
		NewPassword string `json:"newPassword"`
	}

	// Bind JSON input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	// Get email from context
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not found in context"})
		return
	}

	// Retrieve the current password hash from the database
	var storedPasswordHash string
	err := database.DB.QueryRow("SELECT password_hash FROM credentials WHERE email = $1", email).Scan(&storedPasswordHash)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error fetching user data"})
		return
	}

	// Check if old password matches the stored hash
	err = bcrypt.CompareHashAndPassword([]byte(storedPasswordHash), []byte(input.OldPassword))
	if err != nil {
		c.JSON(400, gin.H{"error": "Old password is incorrect"})
		return
	}

	// Hash the new password
	hashedNewPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error hashing the new password"})
		return
	}

	// Update the password in the database
	_, err = database.DB.Exec("UPDATE credentials SET password_hash = $1 WHERE email = $2", hashedNewPassword, email)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error updating the password"})
		return
	}

	// Respond with success
	c.JSON(200, gin.H{"message": "Password updated successfully"})
}

func GetUserEmail(c *gin.Context) {
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"email": email})
}

// Handle login route
func Login(c *gin.Context) {
	var input LoginInput

	// Parse the incoming JSON request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Retrieve user from the database by email
	user, err := getUserByEmail(input.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Compare the hashed password with the input password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if input.Email != "admin@gmail.com" {
		// Fetch user details from the users table
		var userDetails struct {
			First_Name          string `json:"first_name"`
			Last_Name           string `json:"last_name"`
			Gender              string `json:"gender"`
			Location            string `json:"location"`
			Email               string `json:"email"`
			Phone               string `json:"phone"`
			Department          string `json:"department"`
			Role                string `json:"role"`
			Salary              int    `json:"salary"`
			Join_Date           string `json:"join_date"`
			Years_of_Experience int    `json:"years_of_experience"`
		}
		err = database.DB.QueryRow(`
			SELECT first_name, last_name, gender, location, email, phone, department, role, salary, join_date, years_of_experience
			FROM users WHERE email = $1`, input.Email).Scan(
			&userDetails.First_Name, &userDetails.Last_Name, &userDetails.Gender, &userDetails.Location, &userDetails.Email, &userDetails.Phone,
			&userDetails.Department, &userDetails.Role, &userDetails.Salary, &userDetails.Join_Date, &userDetails.Years_of_Experience)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		// Retrieve the secret key from the environment variables
		SecretKey := []byte(os.Getenv("SECRET_KEY"))
		if SecretKey == nil || len(SecretKey) == 0{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Secret key not found"})
			return
		}

		// Create the JWT token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"email": input.Email,
			"exp":   time.Now().Add(time.Hour * 1).Unix(), // Token expiration time (1 hour)
		})

		// Sign the token with the secret key
		tokenString, err := token.SignedString(SecretKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
			return
		}
		// Extract the email from the token claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["email"] == nil {
		}

		// Respond with token and user details
		c.JSON(http.StatusOK, gin.H{
			"token":     tokenString,
			"user_data": userDetails,
			"email":     input.Email,
		})
	} else {

		// Retrieve the secret key from the environment variables
		SecretKey := []byte(os.Getenv("SECRET_KEY"))
		if SecretKey == nil || len(SecretKey) == 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Secret key not found"})
			return
		}

		// Create the JWT token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"email": input.Email,
			"exp":   time.Now().Add(time.Hour * 1).Unix(), // Token expiration time (1 hour)
		})

		// Sign the token with the secret key
		tokenString, err := token.SignedString(SecretKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
			return
		}

		// Return the token in the response
		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	}
}
