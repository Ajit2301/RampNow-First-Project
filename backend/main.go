package main

import (
	"admin-dashboard/database"
	"admin-dashboard/routes"
	"admin-dashboard/controllers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Database setup
	database.InitDB()
	

	// Register the admin user
	controllers.RegisterAdmin()

	router := gin.Default()
	routes.SetupRoutes(router)
	router.Run(":8080")
}
