# Implementation Plan: Candidate & Job Modules

## Overview

This document outlines the implementation plan for the Candidate and Job modules in the JobMate backend, using the latest NestJS features and best practices.

## Database Design

### Entity Relationship Diagram (Conceptual)

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│     Job         │         │  JobApplication  │         │   Candidate     │
├─────────────────┤         ├──────────────────┤         ├─────────────────┤
│ id (PK)         │◄───────┤│ id (PK)          │         │ id (PK)         │
│ title           │         │ jobId (FK)       │────────►│ email           │
│ description     │         │ candidateId (FK) │         │ firstName       │
│ company         │         │ status           │         │ lastName        │
│ location        │         │ appliedAt         │         │ phone           │
│ salaryMin       │         │ coverLetter      │         │ resumeUrl       │
│ salaryMax       │         │ resumeUrl        │         │ skills          │
│ employmentType  │         │ notes            │         │ experience      │
│ status          │         │ createdAt        │         │ education       │
│ requirements    │         │ updatedAt        │         │ createdAt       │
│ benefits        │         │                  │         │ updatedAt       │
│ postedAt        │         │                  │         │                 │
│ expiresAt       │         │                  │         │                 │
│ createdAt       │         │                  │         │                 │
│ updatedAt       │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Database Schema Details

#### 1. Job Entity
- **Purpose**: Store job postings
- **Key Fields**:
  - `id`: UUID primary key
  - `title`: Job title (required)
  - `description`: Full job description
  - `company`: Company name
  - `location`: Job location (city, country)
  - `salaryMin`, `salaryMax`: Salary range
  - `employmentType`: ENUM (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE)
  - `status`: ENUM (DRAFT, PUBLISHED, CLOSED, ARCHIVED)
  - `requirements`: JSON array of requirements
  - `benefits`: JSON array of benefits
  - `postedAt`: When job was posted
  - `expiresAt`: Job expiration date
  - `createdAt`, `updatedAt`: Timestamps

#### 2. Candidate Entity
- **Purpose**: Store candidate profiles
- **Key Fields**:
  - `id`: UUID primary key
  - `email`: Unique email (required, indexed)
  - `firstName`, `lastName`: Personal information
  - `phone`: Contact phone
  - `resumeUrl`: URL to resume file
  - `skills`: JSON array of skills
  - `experience`: JSON array of work experience
  - `education`: JSON array of education history
  - `createdAt`, `updatedAt`: Timestamps

#### 3. JobApplication Entity (Join Table)
- **Purpose**: Track applications from candidates to jobs
- **Key Fields**:
  - `id`: UUID primary key
  - `jobId`: Foreign key to Job
  - `candidateId`: Foreign key to Candidate
  - `status`: ENUM (PENDING, REVIEWING, SHORTLISTED, INTERVIEWED, REJECTED, ACCEPTED)
  - `coverLetter`: Optional cover letter text
  - `resumeUrl`: Resume URL for this specific application
  - `notes`: Internal notes
  - `appliedAt`: Application timestamp
  - `createdAt`, `updatedAt`: Timestamps
  - **Unique Constraint**: (jobId, candidateId) - one application per candidate per job

### Indexes
- `Job.status`, `Job.postedAt` - for filtering active jobs
- `JobApplication.status`, `JobApplication.appliedAt` - for querying applications
- `Candidate.email` - for authentication and lookup

## Technology Stack

### Core Dependencies
- **NestJS**: ^10.x (latest stable) - [Official Docs](https://docs.nestjs.com/)
- **TypeORM**: ^0.3.x (most popular ORM with NestJS, official integration) - [TypeORM Docs](https://typeorm.io/)
- **PostgreSQL**: Recommended database (or MySQL/MariaDB)
- **class-validator**: For DTO validation - [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- **class-transformer**: For DTO transformation
- **@nestjs/config**: For configuration management - [NestJS Config](https://docs.nestjs.com/techniques/configuration)
- **@nestjs/swagger**: For API documentation - [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction)
- **@nestjs/typeorm**: Official TypeORM integration - [NestJS Database](https://docs.nestjs.com/techniques/database)
- **joi**: Optional but recommended for environment variable validation

### Additional Features
- **@nestjs/cache-manager**: For caching (optional)
- **@nestjs/bull**: For job queues (optional, for async processing)
- **@nestjs/throttler**: For rate limiting

## Architecture & Module Structure

```
src/
├── core/                          # Core module (global filters, guards, interceptors)
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   └── core.module.ts
│
├── shared/                        # Shared module
│   ├── utils/
│   ├── decorators/
│   ├── types/
│   └── shared.module.ts
│
├── database/                      # Database configuration
│   ├── config/
│   │   └── typeorm.config.ts
│   ├── migrations/
│   └── database.module.ts
│
├── candidate/                     # Candidate module
│   ├── models/
│   │   ├── dto/
│   │   │   ├── create-candidate.dto.ts
│   │   │   ├── update-candidate.dto.ts
│   │   │   └── query-candidate.dto.ts
│   │   └── types/
│   │       └── candidate-response.type.ts
│   ├── entities/
│   │   └── candidate.entity.ts
│   ├── services/
│   │   └── candidate.service.ts
│   ├── controllers/
│   │   └── candidate.controller.ts
│   ├── candidate.module.ts
│   └── candidate.controller.spec.ts
│
├── job/                           # Job module
│   ├── models/
│   │   ├── dto/
│   │   │   ├── create-job.dto.ts
│   │   │   ├── update-job.dto.ts
│   │   │   └── query-job.dto.ts
│   │   └── types/
│   │       └── job-response.type.ts
│   ├── entities/
│   │   └── job.entity.ts
│   ├── services/
│   │   └── job.service.ts
│   ├── controllers/
│   │   └── job.controller.ts
│   ├── job.module.ts
│   └── job.controller.spec.ts
│
├── job-application/               # Job Application module
│   ├── models/
│   │   ├── dto/
│   │   │   ├── create-application.dto.ts
│   │   │   ├── update-application.dto.ts
│   │   │   └── query-application.dto.ts
│   │   └── types/
│   │       └── application-response.type.ts
│   ├── entities/
│   │   └── job-application.entity.ts
│   ├── services/
│   │   └── job-application.service.ts
│   ├── controllers/
│   │   └── job-application.controller.ts
│   ├── job-application.module.ts
│   └── job-application.controller.spec.ts
│
└── app.module.ts
```

## Implementation Steps

### Phase 1: Setup & Configuration

1. **Update Dependencies**
   - Upgrade NestJS to latest version (^10.x)
   - Install MikroORM and PostgreSQL driver
   - Install validation and transformation packages
   - Install Swagger for API documentation

2. **Database Configuration**
   - Setup MikroORM configuration
   - Create database connection module
   - Configure environment variables
   - Setup migration system

3. **Core Module Setup**
   - Create global exception filter
   - Create logging interceptor
   - Create transform interceptor
   - Setup Swagger documentation

### Phase 2: Entity Implementation

1. **Create Base Entity** (optional, for common fields)
   - `id`, `createdAt`, `updatedAt` fields
   - Timestamp handling

2. **Implement Job Entity**
   - Define entity with MikroORM decorators
   - Add validation decorators
   - Define relationships

3. **Implement Candidate Entity**
   - Define entity with MikroORM decorators
   - Add validation decorators
   - Define relationships

4. **Implement JobApplication Entity**
   - Define entity with MikroORM decorators
   - Add validation decorators
   - Define relationships to Job and Candidate
   - Add unique constraint

### Phase 3: DTOs & Validation

1. **Create DTOs for each module**
   - Create DTOs with class-validator
   - Create Query DTOs for filtering/pagination
   - Create Response types (not DTOs, as per rules)

2. **Validation Rules**
   - Email validation
   - URL validation for resume
   - Enum validation for status fields
   - Date validation

### Phase 4: Service Layer

1. **Candidate Service**
   - `createCandidate()` - Create new candidate
   - `findAll()` - List candidates with pagination/filtering
   - `findOne()` - Get candidate by ID
   - `updateCandidate()` - Update candidate
   - `removeCandidate()` - Delete candidate
   - `findByEmail()` - Find candidate by email

2. **Job Service**
   - `createJob()` - Create new job
   - `findAll()` - List jobs with pagination/filtering
   - `findOne()` - Get job by ID
   - `updateJob()` - Update job
   - `removeJob()` - Delete job
   - `findPublished()` - Get published jobs
   - `findByStatus()` - Filter by status

3. **JobApplication Service**
   - `createApplication()` - Create new application
   - `findAll()` - List applications with pagination/filtering
   - `findOne()` - Get application by ID
   - `updateApplication()` - Update application status
   - `findByJob()` - Get applications for a job
   - `findByCandidate()` - Get applications for a candidate
   - `checkDuplicate()` - Prevent duplicate applications

### Phase 5: Controller Layer

1. **Candidate Controller**
   - `POST /candidates` - Create candidate
   - `GET /candidates` - List candidates (with query params)
   - `GET /candidates/:id` - Get candidate by ID
   - `PATCH /candidates/:id` - Update candidate
   - `DELETE /candidates/:id` - Delete candidate
   - `GET /candidates/admin/test` - Smoke test endpoint

2. **Job Controller**
   - `POST /jobs` - Create job
   - `GET /jobs` - List jobs (with query params)
   - `GET /jobs/:id` - Get job by ID
   - `PATCH /jobs/:id` - Update job
   - `DELETE /jobs/:id` - Delete job
   - `GET /jobs/published` - Get published jobs
   - `GET /jobs/admin/test` - Smoke test endpoint

3. **JobApplication Controller**
   - `POST /applications` - Create application
   - `GET /applications` - List applications (with query params)
   - `GET /applications/:id` - Get application by ID
   - `PATCH /applications/:id` - Update application
   - `GET /applications/job/:jobId` - Get applications for job
   - `GET /applications/candidate/:candidateId` - Get applications for candidate
   - `GET /applications/admin/test` - Smoke test endpoint

### Phase 6: Testing

1. **Unit Tests**
   - Service tests with mocked repositories
   - Controller tests with mocked services
   - DTO validation tests

2. **E2E Tests**
   - Full flow tests for each module
   - Integration tests with database

### Phase 7: Documentation & Polish

1. **API Documentation**
   - Swagger/OpenAPI documentation
   - Example requests/responses
   - Error response documentation

2. **Code Quality**
   - Linting
   - Formatting
   - JSDoc comments

## Latest NestJS Features to Use

1. **Standalone Applications** (NestJS 9+)
   - Use `NestFactory.createApplicationContext()` if needed
   - Modular imports with `imports` array

2. **Config Module** (Latest)
   - Use `@nestjs/config` with validation schema
   - Type-safe configuration

3. **Serialization**
   - Use `@SerializeOptions()` decorator
   - Use `class-transformer` for response transformation

4. **Validation Pipes**
   - Global validation pipe with `ValidationPipe`
   - Custom validation decorators

5. **Exception Filters**
   - Global exception filter
   - Custom exception classes

6. **Interceptors**
   - Response transformation interceptor
   - Logging interceptor

7. **Swagger/OpenAPI**
   - Automatic API documentation
   - Decorators for endpoints

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

# MikroORM
MIKRO_ORM_CLI=./src/database/config/mikro-orm.config.ts
```

## Migration Strategy

1. Use TypeORM migrations for schema changes
2. Create initial migration after entity setup
3. Use `typeorm migration:create` for schema updates
4. Version control all migrations
5. Use `synchronize: false` in production (use migrations only)

## Security Considerations

1. **Input Validation**
   - All DTOs validated with class-validator
   - Sanitize user inputs

2. **SQL Injection**
   - Use MikroORM query builder (parameterized queries)

3. **Rate Limiting**
   - Implement throttler for API endpoints

4. **Authentication** (Future)
   - JWT-based authentication
   - Role-based access control

## Performance Optimizations

1. **Database Indexing**
   - Index frequently queried fields
   - Composite indexes for common queries

2. **Pagination**
   - Implement cursor-based or offset-based pagination
   - Limit maximum page size

3. **Caching** (Optional)
   - Cache frequently accessed data
   - Use Redis for distributed caching

4. **Query Optimization**
   - Use eager/lazy loading appropriately
   - Avoid N+1 query problems

## Next Steps

1. Review and approve this plan
2. Setup development environment
3. Begin Phase 1 implementation
4. Iterate through phases with code reviews

