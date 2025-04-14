package routes

import (
	"admin-dashboard/controllers"
	"admin-dashboard/middleware"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.POST("/login", controllers.Login)
	router.POST("/check-email", controllers.CheckEmail)
	router.POST("/check-email-exists", controllers.CheckEmailExists)
	router.POST("/register", controllers.RegisterUser)

	authorized := router.Group("/")
	log.Println("Setting up protected routes with AuthMiddleware")
	authorized.Use(middleware.AuthMiddleware())
	{
		authorized.GET("/get-user-email", controllers.GetUserEmail)
		authorized.PUT("/change-password", controllers.ChangePassword)
		authorized.POST("/users", controllers.CreateUser)
		authorized.GET("/users", controllers.GetUsers)
		authorized.PUT("/users/:id", controllers.UpdateUser)
		authorized.DELETE("/users/:id", controllers.DeleteUser)
	}
}
