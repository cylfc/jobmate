# Troubleshooting Guide

## 🔴 Lỗi: "password authentication failed for user postgres"

### Nguyên nhân

Lỗi này xảy ra khi:
1. Password trong `.env` không khớp với password trong Docker container
2. Docker container đã được tạo với password khác trước đó
3. Backend chưa restart sau khi thay đổi `.env`

### Giải pháp

#### Bước 1: Kiểm tra file .env

```bash
cd /Users/miguel/01.Dev/01.thepayload/51.jobmate/backend
cat .env
```

Đảm bảo có:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_db
```

#### Bước 2: Recreate Docker container với password mới

```bash
# Stop và xóa container + volume (⚠️ sẽ xóa data)
docker compose down -v

# Start lại với password từ .env
docker compose up -d postgres

# Kiểm tra container đang chạy
docker compose ps
```

#### Bước 3: Verify password trong container

```bash
# Test kết nối từ Docker
docker compose exec postgres psql -U postgres -d jobmate_db -c "SELECT 1;"
```

Nếu thành công, container đã có password đúng.

#### Bước 4: Restart backend

```bash
# Stop backend nếu đang chạy (Ctrl+C)
# Start lại để đọc .env mới
pnpm run start:dev
```

### Giải pháp nhanh (Recommended)

```bash
# 1. Đảm bảo .env có password đúng
echo "DB_PASSWORD=postgres" >> .env

# 2. Recreate container
docker compose down -v
docker compose up -d postgres

# 3. Đợi container ready (5-10 giây)
sleep 5

# 4. Restart backend
pnpm run start:dev
```

### Kiểm tra kết nối

```bash
# Test từ command line
psql -h localhost -U postgres -d jobmate_db
# Nhập password: postgres
```

### Nếu vẫn lỗi

1. **Kiểm tra có nhiều file .env không:**
   ```bash
   find . -name ".env*" -type f
   ```

2. **Kiểm tra environment variables:**
   ```bash
   env | grep DB_
   ```

3. **Kiểm tra Docker container environment:**
   ```bash
   docker compose exec postgres env | grep POSTGRES
   ```

4. **Xem logs chi tiết:**
   ```bash
   docker compose logs postgres
   pnpm run start:dev  # Xem backend logs
   ```

### Common Issues

#### Issue 1: Container đã được tạo với password cũ

**Giải pháp:** Recreate container
```bash
docker compose down -v
docker compose up -d postgres
```

#### Issue 2: Backend không đọc .env

**Giải pháp:** 
- Đảm bảo file `.env` ở đúng thư mục `backend/`
- Restart backend
- Kiểm tra `app.module.ts` có `envFilePath: '.env'`

#### Issue 3: Multiple .env files

**Giải pháp:** Xóa các file .env không cần thiết, chỉ giữ một file `.env` ở root của backend

### Prevention

Để tránh lỗi này:

1. ✅ Luôn set `DB_PASSWORD` trong `.env` trước khi start Docker
2. ✅ Dùng `docker compose down -v` khi thay đổi password
3. ✅ Restart backend sau khi thay đổi `.env`
4. ✅ Verify connection trước khi start backend

