package controllers

import (
	"admin-dashboard/models"
	"net/http"
	"strconv"
	"strings"
	"time"
	"log"
	"github.com/gin-gonic/gin"
)

// Get all users
func GetUsers(c *gin.Context) {
	page := c.DefaultQuery("page", "1")    // Default page is 1
	limit := c.DefaultQuery("limit", "10") // Default limit is 10

	pageInt, err := strconv.Atoi(page)
	if err != nil || pageInt <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page number"})
		return
	}

	limitInt, err := strconv.Atoi(limit)
	if err != nil || limitInt <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit number"})
		return
	}

	offset := (pageInt - 1) * limitInt

	// Get optional filters
	filters := models.UserFilters{
		FirstName: c.Query("first_name"),
		LastName:  c.Query("last_name"),
		Email:     c.Query("email"),
		Phone:     c.Query("phone"),
	}

	genders := c.QueryArray("gender[]") // Check for `gender[]` format

	if len(genders) == 0 { // Fallback to `gender=value1,value2` format
		genderParam := c.Query("gender")
		if genderParam != "" {
			genders = strings.Split(genderParam, ",") // Split comma-separated values
		}
	}
	filters.Gender = genders

	locations := c.QueryArray("location[]") // Check for `location[]` format

	if len(locations) == 0 { // Fallback to `location=value1,value2` format
		locationParam := c.Query("location")
		if locationParam != "" {
			locations = strings.Split(locationParam, ",") // Split comma-separated values
		}
	}
	filters.Location = locations

	departments := c.QueryArray("department[]") // Check for `department[]` format

	if len(departments) == 0 { // Fallback to `department=value1,value2` format
		departmentParam := c.Query("department")
		if departmentParam != "" {
			departments = strings.Split(departmentParam, ",") // Split comma-separated values
		}
	}
	filters.Department = departments

	roles := c.QueryArray("role[]") // Check for `role[]` format

	if len(roles) == 0 { // Fallback to `role=value1,value2` format
		roleParam := c.Query("role")
		if roleParam != "" {
			roles = strings.Split(roleParam, ",") // Split comma-separated values
		}
	}
	filters.Role = roles

	// Parse Salary and YearsOfExperience

	if salaryFrom := c.Query("salary_from");
	salaryFrom != "" {
		from, err := strconv.Atoi(salaryFrom)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary_from value"})
			return
		}
		filters.SalaryFrom = &from
	}

	if salaryTo := c.Query("salary_to");
	salaryTo != "" {
		to, err := strconv.Atoi(salaryTo)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary_to value"})
			return
		}
		filters.SalaryTo = &to
	}

	if joinDateFrom := c.Query("join_date_from");
	joinDateFrom != "" {
		// Validate the date format if necessary
		if _, err := time.Parse("2006-01-02", joinDateFrom); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid join_date_from value. Expected format: YYYY-MM-DD"})
			return
		}
		filters.JoinDateFrom = joinDateFrom
	}

	if joinDateTo := c.Query("join_date_to");
	joinDateTo != "" {
		// Validate the date format if necessary
		if _, err := time.Parse("2006-01-02", joinDateTo); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid join_date_to value. Expected format: YYYY-MM-DD"})
			return
		}
		filters.JoinDateTo = joinDateTo
	}

	if experienceFrom := c.Query("years_of_experience_from");
	experienceFrom != "" {
		from, err := strconv.Atoi(experienceFrom)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid experience_from value"})
			return
		}
		filters.ExperienceFrom = &from
	}

	if experienceTo := c.Query("years_of_experience_to");
	experienceTo != "" {
		to, err := strconv.Atoi(experienceTo)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid experience_to value"})
			return
		}
		filters.ExperienceTo = &to
	}

	users, total, err := models.GetAllUsers(offset, limitInt, filters)
if err != nil {
	log.Printf("Error fetching users: %v", err) // Log the actual error
	log.Println("Query failed:", err) // <-- ADD THIS
	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}) // show detailed error
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
	return
}


	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": total,
		"page":  pageInt,
		"limit": limitInt,
	})
}

// Create a new user
func CreateUser(c *gin.Context) {
	var userRequest struct {
		First_Name          string      `json:"first_name"`
		Last_Name           string      `json:"last_name"`
		Gender              string      `json:"gender"`
		Location            string      `json:"location"`
		Email               string      `json:"email"`
		Phone               string      `json:"phone"`
		Department          string      `json:"department"`
		Role                string      `json:"role"`
		Salary              interface{} `json:"salary"`
		Join_Date           string      `json:"join_date"`
		Years_of_Experience interface{} `json:"years_of_experience"`
	}

	if err := c.ShouldBindJSON(&userRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Handle salary as int or string
	var salary int
	switch v := userRequest.Salary.(type) {
	case float64:
		salary = int(v) // If it's a number
	case string:
		parsedSalary, err := strconv.Atoi(v) // If it's a string
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary format"})
			return
		}
		salary = parsedSalary
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary type"})
		return
	}

	// Handle years_of_experience as int or string
	var yearsOfExperience int
	switch v := userRequest.Years_of_Experience.(type) {
	case float64:
		yearsOfExperience = int(v)
	case string:
		parsedYears, err := strconv.Atoi(v)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid years_of_experience format"})
			return
		}
		yearsOfExperience = parsedYears
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid years_of_experience type"})
		return
	}

	id, err := models.CreateUser(userRequest.First_Name, userRequest.Last_Name, userRequest.Gender, userRequest.Location, userRequest.Email, userRequest.Phone, userRequest.Department, userRequest.Role, salary, userRequest.Join_Date, yearsOfExperience)

	if err != nil {
		if err.Error() == "email already exists" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot create user as the email already exists."})
		} else if  err.Error() == "phone already exists" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot create user as the phone number already exists."})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// Update an existing user
func UpdateUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err1 := strconv.Atoi(idParam) // Convert to int
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	var userRequest struct {
		First_Name          string      `json:"first_name"`
		Last_Name           string      `json:"last_name"`
		Gender              string      `json:"gender"`
		Location            string      `json:"location"`
		Email               string      `json:"email"`
		Phone               string      `json:"phone"`
		Department          string      `json:"department"`
		Role                string      `json:"role"`
		Salary              interface{} `json:"salary"`
		Join_Date           string      `json:"join_date"`
		Years_of_Experience interface{} `json:"years_of_experience"`
	}

	if err := c.ShouldBindJSON(&userRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Handle salary as int or string
	var salary int
	switch v := userRequest.Salary.(type) {
	case float64:
		salary = int(v) // If it's a number
	case string:
		parsedSalary, err := strconv.Atoi(v) // If it's a string
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary format"})
			return
		}
		salary = parsedSalary
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary type"})
		return
	}

	// Handle years_of_experience as int or string
	var yearsOfExperience int
	switch v := userRequest.Years_of_Experience.(type) {
	case float64:
		yearsOfExperience = int(v)
	case string:
		parsedYears, err := strconv.Atoi(v)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid years_of_experience format"})
			return
		}
		yearsOfExperience = parsedYears
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid years_of_experience type"})
		return
	}

	err := models.UpdateUser(id, userRequest.First_Name, userRequest.Last_Name, userRequest.Gender, userRequest.Location, userRequest.Email, userRequest.Phone, userRequest.Department, userRequest.Role, salary, userRequest.Join_Date, yearsOfExperience)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// Delete a user
func DeleteUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err1 := strconv.Atoi(idParam) // Convert to int
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	err := models.DeleteUser(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
