# Use an official Golang image
FROM golang:1.21

# Set working directory
WORKDIR /app

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Run go mod tidy to ensure dependencies are updated
RUN go mod tidy

# Copy the rest of the application code
COPY . .

# Build the Go application
RUN go build -o main .

# Expose the backend port
EXPOSE 8080

# Run the application
CMD ["./main"]
