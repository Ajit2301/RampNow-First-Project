package models

import (
	"admin-dashboard/database"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type User struct {
	ID                  int       `json:"id"`
	First_Name          string    `json:"first_name"`
	Last_Name           string    `json:"last_name"`
	Gender              string    `json:"gender"`
	Location            string    `json:"location"`
	Email               string    `json:"email"`
	Phone               string    `json:"phone"`
	Department          string    `json:"department"`
	Role                string    `json:"role"`
	Salary              int       `json:"salary"`
	Join_Date           string    `json:"join_date"`
	Years_of_Experience int       `json:"years_of_experience"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type UserFilters struct {
	FirstName      string
	LastName       string
	Gender         []string
	Location       []string
	Email          string
	Phone          string
	Department     []string
	Role           []string
	SalaryFrom     *int
	SalaryTo       *int
	JoinDateFrom   string
	JoinDateTo     string
	ExperienceFrom *int
	ExperienceTo   *int
}

// Function to get all users from the database
func GetAllUsers(offset, limit int, filters UserFilters) ([]User, int, error) {
	var users []User
	var total int

	// Build the WHERE clause dynamically
	var conditions []string
	var args []interface{}
	argIndex := 1

	if filters.FirstName != "" {
		conditions = append(conditions, fmt.Sprintf("first_name ILIKE $%d", argIndex))
		args = append(args, "%"+filters.FirstName+"%")
		argIndex++
	}
	if filters.LastName != "" {
		conditions = append(conditions, fmt.Sprintf("last_name ILIKE $%d", argIndex))
		args = append(args, "%"+filters.LastName+"%")
		argIndex++
	}
	
	if len(filters.Gender) > 0 {
		placeholders := []string{}
		for _, gender := range filters.Gender {
			placeholders = append(placeholders, fmt.Sprintf("$%d", argIndex))
			args = append(args, gender)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("gender IN (%s)", strings.Join(placeholders, ",")))
	}
	if len(filters.Location) > 0 {
		placeholders := []string{}
		for _, location := range filters.Location {
			placeholders = append(placeholders, fmt.Sprintf("$%d", argIndex))
			args = append(args, location)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("location IN (%s)", strings.Join(placeholders, ",")))
	}
	if filters.Email != "" {
		conditions = append(conditions, fmt.Sprintf("email ILIKE $%d", argIndex))
		args = append(args, "%"+filters.Email+"%")
		argIndex++
	}
	if filters.Phone != "" {
		conditions = append(conditions, fmt.Sprintf("phone ILIKE $%d", argIndex))
		args = append(args, "%"+filters.Phone+"%")
		argIndex++
	}
	if len(filters.Department) > 0 {
		placeholders := []string{}
		for _, department := range filters.Department {
			placeholders = append(placeholders, fmt.Sprintf("$%d", argIndex))
			args = append(args, department)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("department IN (%s)", strings.Join(placeholders, ",")))
	}
	if len(filters.Role) > 0 {
		placeholders := []string{}
		for _, role := range filters.Role {
			placeholders = append(placeholders, fmt.Sprintf("$%d", argIndex))
			args = append(args, role)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("role IN (%s)", strings.Join(placeholders, ",")))
	}
	
	if filters.SalaryFrom != nil {
		conditions = append(conditions, fmt.Sprintf("salary >= $%d", argIndex))
		args = append(args, *filters.SalaryFrom)
		argIndex++
	}
	if filters.SalaryTo != nil {
		conditions = append(conditions, fmt.Sprintf("salary <= $%d", argIndex))
		args = append(args, *filters.SalaryTo)
		argIndex++
	}

	if filters.JoinDateFrom != "" {
		conditions = append(conditions, fmt.Sprintf("join_date >= $%d", argIndex))
		args = append(args, filters.JoinDateFrom)
		argIndex++
	}
	if filters.JoinDateTo != "" {
		conditions = append(conditions, fmt.Sprintf("join_date <= $%d", argIndex))
		args = append(args, filters.JoinDateTo)
		argIndex++
	}

	if filters.ExperienceFrom != nil {
		conditions = append(conditions, fmt.Sprintf("years_of_experience >= $%d", argIndex))
		args = append(args, *filters.ExperienceFrom)
		argIndex++
	}
	if filters.ExperienceTo != nil {
		conditions = append(conditions, fmt.Sprintf("years_of_experience <= $%d", argIndex))
		args = append(args, *filters.ExperienceTo)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf("SELECT id, first_name, last_name, gender, location, email, phone, department, role, salary, join_date, years_of_experience, created_at, updated_at FROM users %s ORDER BY id LIMIT $%d OFFSET $%d", whereClause, argIndex, argIndex+1)
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM users %s", whereClause)

	// Get total count
	err := database.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated users
	rows, err := database.DB.Query(query, append(args, limit, offset)...)
	if err != nil {
		return nil, 0, err
	}

	defer rows.Close()

	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.First_Name, &user.Last_Name, &user.Gender, &user.Location, &user.Email, &user.Phone, &user.Department, &user.Role, &user.Salary, &user.Join_Date, &user.Years_of_Experience, &user.CreatedAt, &user.UpdatedAt); err != nil {
			return nil, 0, err
		}
		users = append(users, user)
	}

	return users, total, nil
}

// Function to insert a new user into the database
func CreateUser(first_name, last_name, gender, location, email, phone, department, role string, salary int, join_date string, years_of_experience int) (int, error) {
	// Check if email already exists
	emailCheckQuery := "SELECT id FROM users WHERE email = $1"
	var existingID int
	err := database.DB.QueryRow(emailCheckQuery, email).Scan(&existingID)
	if err == nil {
		// If no error, it means the email already exists
		return 0, fmt.Errorf("email already exists")
	} else if err != sql.ErrNoRows {
		// If the error is not "no rows found", return the error
		return 0, err
	}

	// Check if phone number already exists
	phoneCheckQuery := "SELECT id FROM users WHERE phone = $1"
	var existingID2 int
	err2 := database.DB.QueryRow(phoneCheckQuery, phone).Scan(&existingID2)
	if err2 == nil {
		// If no error, it means the phone number already exists
		return 0, fmt.Errorf("phone already exists")
	} else if err != sql.ErrNoRows {
		// If the error is not "no rows found", return the error
		return 0, err
	}

	// Proceed to insert the new user
	insertQuery := `
		INSERT INTO users 
		(first_name, last_name, gender, location, email, phone, department, role, salary, join_date, years_of_experience, created_at, updated_at) 
		VALUES 
		($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) 
		RETURNING id`
	var id int
	err = database.DB.QueryRow(insertQuery, first_name, last_name, gender, location, email, phone, department, role, salary, join_date, years_of_experience).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// Function to update an existing user's details
func UpdateUser(id int, first_name, last_name, gender, location, email, phone, department, role string, salary int, join_date string, years_of_experience int) error {
	query := "UPDATE users SET first_name = $1, last_name = $2, gender = $3, location = $4, email = $5, phone = $6, department = $7, role = $8, salary = $9, join_date = $10, years_of_experience = $11, updated_at = NOW() WHERE id = $12"
	_, err := database.DB.Exec(query, first_name, last_name, gender, location, email, phone, department, role, salary, join_date, years_of_experience, id)
	return err
}

// Function to delete a user by ID
func DeleteUser(id int) error {
	query := "DELETE FROM users WHERE id = $1"
	_, err := database.DB.Exec(query, id)
	return err
}
