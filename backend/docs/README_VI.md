# Kế Hoạch Triển Khai: Module Candidate & Job

## Tổng Quan

Tài liệu này mô tả kế hoạch triển khai các module **Candidate** (Ứng viên) và **Job** (Việc làm) cho backend JobMate, sử dụng các tính năng mới nhất của NestJS và tuân thủ các quy tắc coding đã định nghĩa.

## Cấu Trúc Database

### 3 Bảng Chính

1. **Job** - Lưu trữ thông tin việc làm
   - Thông tin cơ bản: title, description, company, location
   - Thông tin lương: salaryMin, salaryMax
   - Trạng thái: status (DRAFT, PUBLISHED, CLOSED, ARCHIVED)
   - Loại việc làm: employmentType (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE)
   - Yêu cầu và phúc lợi: requirements, benefits (JSON)

2. **Candidate** - Lưu trữ thông tin ứng viên
   - Thông tin cá nhân: email (unique), firstName, lastName, phone
   - Hồ sơ: resumeUrl, skills, experience, education (JSON)

3. **JobApplication** - Bảng liên kết giữa Job và Candidate
   - Quan hệ: jobId → Job, candidateId → Candidate
   - Trạng thái ứng tuyển: status (PENDING, REVIEWING, SHORTLISTED, INTERVIEWED, REJECTED, ACCEPTED)
   - Thông tin ứng tuyển: coverLetter, resumeUrl, notes
   - Ràng buộc: Một ứng viên chỉ có thể ứng tuyển một lần cho mỗi công việc

## Công Nghệ Sử Dụng

### Core
- **NestJS 10.x** - Framework chính
- **TypeORM 0.3.x** - ORM phổ biến nhất với NestJS (official integration)
- **PostgreSQL** - Database (khuyến nghị)
- **class-validator** - Validation DTOs
- **class-transformer** - Transform DTOs
- **@nestjs/swagger** - API Documentation

### Tính Năng NestJS Mới Nhất

1. **Standalone Applications** - Modular architecture
2. **Config Module** - Type-safe configuration
3. **Global Validation Pipe** - Tự động validate tất cả requests
4. **Exception Filters** - Xử lý lỗi tập trung
5. **Interceptors** - Transform responses, logging
6. **Swagger/OpenAPI** - Tự động generate API docs

## Cấu Trúc Module

```
src/
├── core/                    # Module core (filters, guards, interceptors)
├── shared/                  # Module shared (utils, types)
├── database/                # Database config & migrations
├── candidate/               # Module Candidate
│   ├── models/dto/         # DTOs cho input
│   ├── models/types/       # Types cho output
│   ├── entities/           # MikroORM entities
│   ├── services/           # Business logic
│   └── controllers/        # API endpoints
├── job/                     # Module Job
└── job-application/         # Module Job Application
```

## API Endpoints

### Candidate Module
- `POST /candidates` - Tạo ứng viên mới
- `GET /candidates` - Danh sách ứng viên (có pagination, filter, search)
- `GET /candidates/:id` - Chi tiết ứng viên
- `PATCH /candidates/:id` - Cập nhật ứng viên
- `DELETE /candidates/:id` - Xóa ứng viên
- `GET /candidates/admin/test` - Smoke test

### Job Module
- `POST /jobs` - Tạo việc làm mới
- `GET /jobs` - Danh sách việc làm (có pagination, filter, search)
- `GET /jobs/:id` - Chi tiết việc làm
- `GET /jobs/published` - Danh sách việc làm đã publish
- `PATCH /jobs/:id` - Cập nhật việc làm
- `DELETE /jobs/:id` - Xóa việc làm
- `GET /jobs/admin/test` - Smoke test

### Job Application Module
- `POST /applications` - Tạo đơn ứng tuyển
- `GET /applications` - Danh sách đơn ứng tuyển
- `GET /applications/:id` - Chi tiết đơn ứng tuyển
- `GET /applications/job/:jobId` - Đơn ứng tuyển theo job
- `GET /applications/candidate/:candidateId` - Đơn ứng tuyển theo candidate
- `PATCH /applications/:id` - Cập nhật trạng thái đơn ứng tuyển
- `GET /applications/admin/test` - Smoke test

## Các Bước Triển Khai

### Phase 1: Setup & Configuration
- [ ] Cài đặt dependencies
- [ ] Cấu hình MikroORM
- [ ] Setup database connection
- [ ] Cấu hình environment variables
- [ ] Setup Swagger documentation

### Phase 2: Entity Implementation
- [ ] Tạo Base Entity (optional)
- [ ] Implement Job Entity
- [ ] Implement Candidate Entity
- [ ] Implement JobApplication Entity
- [ ] Tạo database migrations

### Phase 3: DTOs & Validation
- [ ] Tạo DTOs cho Candidate module
- [ ] Tạo DTOs cho Job module
- [ ] Tạo DTOs cho JobApplication module
- [ ] Tạo Query DTOs cho pagination/filtering
- [ ] Setup validation rules

### Phase 4: Service Layer
- [ ] Implement CandidateService
- [ ] Implement JobService
- [ ] Implement JobApplicationService
- [ ] Implement business logic

### Phase 5: Controller Layer
- [ ] Implement CandidateController
- [ ] Implement JobController
- [ ] Implement JobApplicationController
- [ ] Setup API documentation

### Phase 6: Testing
- [ ] Unit tests cho services
- [ ] Unit tests cho controllers
- [ ] E2E tests cho các modules

### Phase 7: Documentation & Polish
- [ ] Hoàn thiện Swagger documentation
- [ ] Code review và refactoring
- [ ] JSDoc comments

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=jobmate
DB_PASSWORD=password
DB_NAME=jobmate_db

# Application
PORT=3000
NODE_ENV=development
```

## Tính Năng Bổ Sung (Tùy Chọn)

1. **Caching** - Sử dụng Redis để cache dữ liệu thường xuyên truy cập
2. **Rate Limiting** - Giới hạn số lượng requests
3. **Job Queue** - Xử lý async tasks (gửi email, xử lý file)
4. **File Upload** - Upload resume files
5. **Search** - Full-text search với PostgreSQL hoặc Elasticsearch

## Bảo Mật

1. **Input Validation** - Tất cả inputs được validate
2. **SQL Injection Protection** - Sử dụng MikroORM query builder
3. **Rate Limiting** - Giới hạn requests
4. **Authentication** (Future) - JWT-based auth
5. **Authorization** (Future) - Role-based access control

## Performance

1. **Database Indexing** - Index các trường thường query
2. **Pagination** - Phân trang cho tất cả list endpoints
3. **Query Optimization** - Tránh N+1 queries
4. **Caching** - Cache dữ liệu thường xuyên truy cập

## Tài Liệu Tham Khảo

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Kế hoạch chi tiết
- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) - Thông số kỹ thuật và code examples
- [NestJS Documentation](https://docs.nestjs.com/)
- [MikroORM Documentation](https://mikro-orm.io/docs)

## Bước Tiếp Theo

1. Review và approve kế hoạch
2. Setup môi trường development
3. Bắt đầu Phase 1 implementation
4. Code review sau mỗi phase

