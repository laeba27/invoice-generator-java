# Deployment Guide

This project is set up to be deployed using **Docker** and **Docker Compose**. This allows you to run the database, backend, and frontend as a single coordinated unit.

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## Quick Start (Local Deployment)

1. **Stop existing services**
   Make sure you aren't running the backend (port 8080), frontend (port 3000), or local MySQL (port 3306) to avoid port conflicts.

2. **Build and Run**
   Open a terminal in the root of the project and run:
   ```bash
   docker-compose up --build
   ```
   This will:
   - Build the Java backend image.
   - Build the Next.js frontend image.
   - Pull the MySQL database image.
   - Start all three services connected together.

3. **Access the Application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8080](http://localhost:8080)

4. **Stop the Application**
   Press `Ctrl+C` in the terminal, or run:
   ```bash
   docker-compose down
   ```

## Cloud Deployment (e.g., AWS, DigitalOcean)

To deploy to a remote server:

1. Copy the entire project to the server.
2. Update `docker-compose.yml`:
   - Change `NEXT_PUBLIC_API_URL` to your server's public IP or domain (e.g., `http://your-domain.com:8080/api`).
   Note: Since Next.js bakes environment variables at build time, you might need to update the `frontend/Dockerfile` to accept build arguments if you change the URL.
3. Run `docker-compose up -d --build`.

## Notes
- **Database Data:** The database data is stored in a Docker volume named `db_data`. It will persist even if you restart containers.
- **Environment Variables:** Configuration is handled in `docker-compose.yml`. You can change database passwords or ports there.
