# Environment Variables Setup Guide

## Tổng Quan

File này hướng dẫn cách cấu hình environment variables cho backend JobMate.

## Các Biến Môi Trường Cần Thiết

### 1. Database Configuration

#### `DB_HOST`
- **Mô tả**: Địa chỉ host của PostgreSQL database
- **Mặc định**: `localhost`
- **Ví dụ**: `localhost`, `127.0.0.1`, `db.example.com`

#### `DB_PORT`
- **Mô tả**: Port của PostgreSQL database
- **Mặc định**: `5432`
- **Ví dụ**: `5432`

#### `DB_USER`
- **Mô tả**: Username để kết nối database
- **Mặc định**: `postgres`
- **Ví dụ**: `postgres`, `jobmate_user`

#### `DB_PASSWORD`
- **Mô tả**: Password để kết nối database
- **Mặc định**: `postgres`
- **Lưu ý**: ⚠️ **KHÔNG** commit password vào git!

#### `DB_NAME`
- **Mô tả**: Tên database
- **Mặc định**: `jobmate_db`
- **Ví dụ**: `jobmate_db`, `jobmate_dev`, `jobmate_prod`

### 2. Application Configuration

#### `PORT`
- **Mô tả**: Port mà ứng dụng sẽ chạy
- **Mặc định**: `3000`
- **Ví dụ**: `3000`, `8080`

#### `NODE_ENV`
- **Mô tả**: Môi trường chạy ứng dụng
- **Giá trị**: `development`, `production`, `test`
- **Mặc định**: `development`
- **Lưu ý**: 
  - `development`: Bật logging, cho phép `synchronize: true`
  - `production`: Tắt logging, bắt buộc dùng migrations

## Cách Setup

### Bước 1: Tạo file .env

Từ thư mục `backend/`, copy file `.env.example`:

```bash
cd /Users/miguel/01.Dev/01.thepayload/51.jobmate/backend
cp .env.example .env
```

### Bước 2: Cập nhật giá trị

Mở file `.env` và cập nhật các giá trị phù hợp với môi trường của bạn:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=jobmate_db

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Bước 3: Tạo Database

Trước khi chạy ứng dụng, bạn cần tạo database:

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE jobmate_db;

# (Optional) Tạo user riêng
CREATE USER jobmate_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jobmate_db TO jobmate_user;

# Thoát
\q
```

### Bước 4: Verify Configuration

Kiểm tra kết nối database:

```bash
# Test kết nối
psql -h localhost -U postgres -d jobmate_db
```

## Cấu Hình Cho Các Môi Trường Khác Nhau

### Development

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_dev
PORT=3000
NODE_ENV=development
```

### Production

```env
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USER=jobmate_prod_user
DB_PASSWORD=strong_secure_password_here
DB_NAME=jobmate_prod
PORT=3000
NODE_ENV=production
```

**Lưu ý Production:**
- ⚠️ `synchronize` sẽ tự động tắt khi `NODE_ENV=production`
- ✅ Bắt buộc sử dụng migrations
- ✅ Sử dụng strong password
- ✅ Không commit `.env` vào git

### Test

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_test
PORT=3001
NODE_ENV=test
```

## Security Best Practices

### 1. Git Ignore

Đảm bảo file `.env` đã được thêm vào `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### 2. Environment Variables trong Production

Trong production, nên sử dụng:
- **Docker**: Environment variables trong `docker-compose.yml`
- **Kubernetes**: Secrets
- **Cloud Platforms**: Environment variables trong platform settings
- **CI/CD**: Secure environment variables

### 3. Password Management

- ✅ Sử dụng password manager
- ✅ Rotate passwords định kỳ
- ✅ Không hardcode passwords trong code
- ✅ Sử dụng secrets management tools (AWS Secrets Manager, HashiCorp Vault, etc.)

## Troubleshooting

### Lỗi: Cannot connect to database

**Nguyên nhân:**
- Database chưa được tạo
- Sai thông tin kết nối (host, port, user, password)
- PostgreSQL service chưa chạy

**Giải pháp:**
```bash
# Kiểm tra PostgreSQL đang chạy
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Kiểm tra kết nối
psql -h localhost -U postgres -d jobmate_db
```

### Lỗi: Database does not exist

**Giải pháp:**
```sql
CREATE DATABASE jobmate_db;
```

### Lỗi: Permission denied

**Giải pháp:**
```sql
GRANT ALL PRIVILEGES ON DATABASE jobmate_db TO your_user;
```

## Kiểm Tra Configuration

Sau khi setup, chạy ứng dụng để kiểm tra:

```bash
pnpm run start:dev
```

Nếu cấu hình đúng, bạn sẽ thấy:
```
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api
```

Nếu có lỗi kết nối database, kiểm tra lại các biến môi trường trong file `.env`.

## File .env.example

File `.env.example` chứa template với các giá trị mặc định. File này **NÊN** được commit vào git để làm reference cho các developers khác.

## Tài Liệu Tham Khảo

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [TypeORM Connection Options](https://typeorm.io/data-source-options)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

