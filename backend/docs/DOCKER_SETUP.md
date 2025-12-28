# Docker Setup Guide

Hướng dẫn setup Docker cho JobMate Backend để dễ dàng chạy database và các services liên quan ở local.

## 📋 Prerequisites

- Docker Desktop (hoặc Docker Engine + Docker Compose)
- Git

## 🚀 Quick Start

### Option 1: Chỉ chạy Database (Recommended cho Development)

Cách này phù hợp khi bạn muốn chạy backend trên máy local và chỉ dùng Docker cho database.

```bash
cd /Users/miguel/01.Dev/01.thepayload/51.jobmate/backend

# Start PostgreSQL
docker compose up -d postgres

# Kiểm tra logs
docker compose logs -f postgres

# Stop database
docker compose down
```

**Cấu hình .env cho local development:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_db
PORT=3000
NODE_ENV=development
```

### Option 2: Chạy Database + pgAdmin

```bash
# Start PostgreSQL + pgAdmin
docker compose -f docker-compose.dev.yml --profile tools up -d

# Access pgAdmin tại: http://localhost:5050
# Email: admin@jobmate.local
# Password: admin
```

### Option 3: Chạy toàn bộ trong Docker (Optional)

Uncomment phần `backend` service trong `docker-compose.yml` nếu muốn chạy backend trong Docker.

## 📁 Files Structure

```
backend/
├── docker-compose.yml          # Main compose file (database only)
├── docker-compose.dev.yml      # Development compose (database + pgAdmin)
├── Dockerfile                  # Backend Dockerfile (optional)
├── .dockerignore              # Docker ignore file
├── .env.docker                # Environment for Docker
└── DOCKER_SETUP.md           # This file
```

## 🔧 Services

### PostgreSQL

- **Image**: `postgres:16-alpine`
- **Port**: `5432`
- **Database**: `jobmate_db` (configurable via env)
- **User**: `postgres` (configurable via env)
- **Password**: `postgres` (configurable via env)
- **Volume**: `jobmate-postgres-data` (persistent data)

### pgAdmin (Optional)

- **Image**: `dpage/pgadmin4:latest`
- **Port**: `5050`
- **Email**: `admin@jobmate.local`
- **Password**: `admin`
- **Access**: http://localhost:5050

## 🎯 Common Commands

### Start Services

```bash
# Start database only
docker compose up -d

# Start database + pgAdmin
docker compose -f docker-compose.dev.yml --profile tools up -d

# Start with logs
docker compose up
```

### Stop Services

```bash
# Stop services
docker compose down

# Stop and remove volumes (⚠️ WARNING: Deletes all data!)
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres
```

### Database Access

```bash
# Connect via psql
docker compose exec postgres psql -U postgres -d jobmate_db

# Or from local machine (if port is exposed)
psql -h localhost -U postgres -d jobmate_db
```

### Reset Database

```bash
# Stop and remove volumes
docker compose down -v

# Start fresh
docker compose up -d
```

## 🔐 Environment Variables

### For Docker Compose

Các biến môi trường có thể được set trong:
1. File `.env` (nếu có)
2. Trực tiếp trong `docker-compose.yml`
3. Export trong shell: `export DB_PASSWORD=my_password`

### Default Values

```env
DB_NAME=jobmate_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432
```

## 📊 Database Connection

### From Local Machine

```typescript
// .env file
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_db
```

### From Docker Container (if backend runs in Docker)

```typescript
// .env.docker file
DB_HOST=postgres  // Service name in docker-compose
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_db
```

## 🛠️ Troubleshooting

### Port Already in Use

Nếu port 5432 đã được sử dụng:

```bash
# Check what's using the port
lsof -i :5432

# Change port in docker-compose.yml
ports:
  - '5433:5432'  # Use 5433 on host, 5432 in container
```

### Database Connection Issues

```bash
# Check if container is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart service
docker compose restart postgres
```

### Permission Issues

```bash
# Fix volume permissions
docker compose down
sudo rm -rf ./postgres_data  # If using local volume
docker compose up -d
```

### Reset Everything

```bash
# Stop and remove everything
docker compose down -v

# Remove images (optional)
docker compose down --rmi all

# Start fresh
docker compose up -d
```

## 📝 pgAdmin Setup

Nếu bạn sử dụng pgAdmin:

1. Access http://localhost:5050
2. Login với:
   - Email: `admin@jobmate.local`
   - Password: `admin`
3. Add new server:
   - **Name**: JobMate DB
   - **Host**: `postgres` (service name)
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: `postgres`

## 🚀 Development Workflow

### Recommended Workflow

1. **Start database in Docker:**
   ```bash
   docker compose up -d postgres
   ```

2. **Run backend locally:**
   ```bash
   pnpm run start:dev
   ```

3. **Access:**
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api
   - Database: localhost:5432

### Why This Approach?

- ✅ Fast development (hot reload)
- ✅ Easy debugging
- ✅ No need to install PostgreSQL locally
- ✅ Consistent database setup
- ✅ Easy to reset database

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

## 🎉 Next Steps

Sau khi setup Docker:

1. ✅ Database đã chạy
2. ✅ Cấu hình `.env` với `DB_HOST=localhost`
3. ✅ Chạy `pnpm run start:dev`
4. ✅ Truy cập http://localhost:3000/api

Happy coding! 🚀

