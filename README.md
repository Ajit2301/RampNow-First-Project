  

# Admin Dashboard Application

This is a full-stack Admin Dashboard Application built with the following technologies:
- **Backend**: Golang (Gin Framework)
- **Frontend**: Next.js with Tailwind CSS
- **Database**: PostgreSQL

The application is containerized using Docker and orchestrated with Docker Compose.

---

## Prerequisites

Before running the application, ensure you have the following installed on your system:
1. **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
2. **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

---

## Setup and Run Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Ajit2301/RampNow-First-Project.git
cd admin-dashboard
```

### 2. Configure Environment Variables

Make sure the following `.env` files are configured:
- **Backend**: `backend/.env`
    ```env
    SECRET_KEY=<YOUR_JWT_SECRET_KEY>
    ADMIN_EMAIL=<YOUR_ADMIN_EMAIL>
    ADMIN_PASSWORD=<YOUR_ADMIN_PASSWORD>
    ```
  **NOTE:** <YOUR_ADMIN_PASSWORD> should be atleast of length 8 with atleast 1 digit and 1 special character.

### 3. Build and Run the Docker Containers

Run the following command to build and start the containers:

```bash
docker-compose up --build
```

### 4. Access the Application

- **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend**: The backend API runs at [http://localhost:8080](http://localhost:8080).

---

## Project Structure

```
.
├── backend          # Backend code (Golang with Gin Framework)
├── frontend         # Frontend code (Next.js with Tailwind CSS)
├── migrations       # Database migration scripts
├── docker-compose.yml # Docker Compose configuration
```

---

## Useful Commands

### Stop the Containers
To stop the running containers, use:
```bash
docker-compose down
```

### Remove Containers, Volumes, and Images
If you want to completely clean up:
```bash
docker-compose down --volumes --rmi all
```

### View Logs
To view the logs for all services:
```bash
docker-compose logs -f
```

---

## Troubleshooting

1. **Database Connection Issues**:
   - Ensure Docker is running and the database container (`db`) is healthy.

2. **Port Conflicts**:
   - If `3000`, `8080`, or `5432` are already in use, update the `docker-compose.yml` file with new ports.

3. **Rebuilding After Changes**:
   - If you make changes to the code or environment, rebuild the containers:
     ```bash
     docker-compose up --build
     ```
