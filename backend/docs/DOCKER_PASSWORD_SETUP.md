# Docker Password Configuration Guide

## 🔐 Cách Password Hoạt Động

Trong `docker-compose.yml`, password được cấu hình như sau:

```yaml
POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
```

Điều này có nghĩa:
- Docker Compose sẽ đọc biến `DB_PASSWORD` từ file `.env` hoặc environment
- Nếu không tìm thấy `DB_PASSWORD`, sẽ dùng giá trị mặc định là `postgres`

## 📝 Cấu Hình Password

### Bước 1: Tạo file .env

Tạo file `.env` trong thư mục `backend/`:

```bash
cd /Users/miguel/01.Dev/01.thepayload/51.jobmate/backend
cp .env.example .env
```

### Bước 2: Cấu hình Password

Mở file `.env` và set password:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password_here  # ⬅️ Đặt password ở đây
DB_NAME=jobmate_db

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Bước 3: Password được sử dụng ở 2 nơi

1. **Docker Compose** - Để tạo PostgreSQL container với password này
2. **Backend Application** - Để kết nối đến database với password này

## 💡 Ví Dụ Cụ Thể

### Ví dụ 1: Password đơn giản (Development)

```env
DB_PASSWORD=postgres
```

Khi chạy `docker compose up -d`, PostgreSQL sẽ được tạo với password `postgres`.

### Ví dụ 2: Password tùy chỉnh

```env
DB_PASSWORD=my_secure_password_123
```

PostgreSQL sẽ được tạo với password `my_secure_password_123`, và backend cũng sẽ dùng password này để kết nối.

### Ví dụ 3: Không set password (dùng mặc định)

Nếu bạn không set `DB_PASSWORD` trong `.env`, Docker sẽ dùng mặc định là `postgres`.

## ⚠️ Lưu Ý Quan Trọng

### 1. Password phải giống nhau

Password trong `.env` phải giống nhau cho cả:
- Docker Compose (để tạo database)
- Backend (để kết nối database)

### 2. File .env không được commit

Đảm bảo `.env` đã có trong `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

### 3. Development vs Production

**Development:**
```env
DB_PASSWORD=postgres  # OK cho local dev
```

**Production:**
```env
DB_PASSWORD=very_strong_random_password_here  # ⚠️ Phải dùng strong password
```

## 🔄 Workflow Hoàn Chỉnh

### 1. Tạo file .env

```bash
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_db
PORT=3000
NODE_ENV=development
EOF
```

### 2. Start Docker với password từ .env

```bash
docker compose up -d postgres
```

Docker sẽ tự động đọc `DB_PASSWORD=postgres` từ file `.env` và tạo PostgreSQL với password đó.

### 3. Backend kết nối với cùng password

Backend đọc từ `.env`:
```env
DB_PASSWORD=postgres
```

Và kết nối đến database với password này.

## 🧪 Test Password

### Kiểm tra password trong Docker

```bash
# Connect to database với password
docker compose exec postgres psql -U postgres -d jobmate_db

# Hoặc từ local machine
psql -h localhost -U postgres -d jobmate_db
# Nhập password khi được hỏi
```

### Kiểm tra backend connection

```bash
# Start backend
pnpm run start:dev

# Nếu kết nối thành công, bạn sẽ thấy:
# Application is running on: http://localhost:3000
```

Nếu có lỗi "password authentication failed", kiểm tra lại password trong `.env`.

## 📋 Quick Reference

| Mục đích | Biến môi trường | Giá trị mặc định |
|----------|----------------|-------------------|
| Docker PostgreSQL password | `DB_PASSWORD` | `postgres` |
| Backend connection password | `DB_PASSWORD` | `postgres` |
| Database user | `DB_USER` | `postgres` |
| Database name | `DB_NAME` | `jobmate_db` |

## 🎯 Recommended Setup

### Cho Local Development

```env
# .env file
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_db
PORT=3000
NODE_ENV=development
```

Đây là setup đơn giản nhất và phù hợp cho development.

### Cho Production

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=jobmate_user
DB_PASSWORD=generate_strong_random_password_here
DB_NAME=jobmate_prod
PORT=3000
NODE_ENV=production
```

## ✅ Checklist

- [ ] File `.env` đã được tạo
- [ ] `DB_PASSWORD` đã được set trong `.env`
- [ ] Password giống nhau cho Docker và Backend
- [ ] File `.env` đã được thêm vào `.gitignore`
- [ ] Đã test kết nối database thành công

## 🆘 Troubleshooting

### Lỗi: "password authentication failed"

**Nguyên nhân:** Password trong `.env` không khớp với password trong Docker container.

**Giải pháp:**
1. Kiểm tra password trong `.env`
2. Restart Docker container:
   ```bash
   docker compose down
   docker compose up -d postgres
   ```

### Lỗi: "environment variable not set"

**Nguyên nhân:** File `.env` không tồn tại hoặc không có `DB_PASSWORD`.

**Giải pháp:**
1. Tạo file `.env` từ `.env.example`
2. Đảm bảo có dòng `DB_PASSWORD=your_password`

### Reset password

Nếu muốn đổi password:

1. Update `.env` với password mới
2. Recreate container:
   ```bash
   docker compose down -v  # ⚠️ Xóa data
   docker compose up -d
   ```

