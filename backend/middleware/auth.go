package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv" // Import godotenv package
)

// Load environment variables from the .env file
func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

// Middleware to protect routes and validate JWT token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the authorization header (token)
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No authorization header"})
			c.Abort()
			return
		}

		// Retrieve the secret key from the environment variables
		SecretKey := []byte(os.Getenv("SECRET_KEY"))
		if SecretKey == nil || len(SecretKey) == 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Secret key not found"})
			return
		}

		// Extract token from the header (bearer token)
		tokenString := strings.Split(authHeader, " ")[1]

		// Parse and validate the JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.NewValidationError("Invalid signing method", jwt.ValidationErrorSignatureInvalid)
			}
			return SecretKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract the email from the token claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["email"] == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No email found in token"})
			c.Abort()
			return
		}

		
		// Set the user email into the context for later use
		c.Set("email", claims["email"].(string))

		// If token is valid, proceed to the next middleware/handler
		c.Next()
	}
}
