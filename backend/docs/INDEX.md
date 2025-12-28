# Documentation Index

## Overview

This directory contains comprehensive documentation for implementing the Candidate and Job modules in the JobMate backend.

## Documentation Files

### 📋 [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
**Comprehensive implementation plan** covering:
- Database design and ERD
- Technology stack
- Architecture and module structure
- Implementation phases
- Latest NestJS features
- Security and performance considerations

**Read this first** for a complete understanding of the project scope and approach.

### 🔧 [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)
**Technical specifications** with code examples:
- Dependencies list
- Database schema (SQL)
- Entity definitions (TypeScript)
- DTO examples
- Service layer examples
- Controller examples
- Module configuration
- Database configuration

**Use this** as a reference when implementing each component.

### 🗄️ [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
**Database schema reference**:
- Entity Relationship Diagram (ERD)
- Table structures
- Enums definitions
- Relationships
- Sample data structures
- Common query patterns

**Reference this** when working with database entities and queries.

### ✅ [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
**Step-by-step implementation checklist**:
- Phase-by-phase tasks
- Checkboxes for tracking progress
- Notes section

**Use this** to track your implementation progress.

### 🇻🇳 [README_VI.md](./README_VI.md)
**Vietnamese summary** of the implementation plan:
- Overview in Vietnamese
- Quick reference
- API endpoints summary
- Implementation phases

**Read this** for a quick overview in Vietnamese.

### 🔄 [ORM_CHOICE.md](./ORM_CHOICE.md)
**ORM selection rationale**:
- Why TypeORM over MikroORM
- Key differences
- Migration notes

**Read this** to understand the ORM choice.

### ✨ [NESTJS_BEST_PRACTICES.md](./NESTJS_BEST_PRACTICES.md)
**Best practices based on official NestJS documentation**:
- Configuration management
- Database setup
- Validation patterns
- Module organization
- Error handling
- Testing strategies

**Read this** to ensure you're following official NestJS best practices.

## Authentication Module Documentation

### 🔐 [AUTH_IMPLEMENTATION_PLAN.md](./AUTH_IMPLEMENTATION_PLAN.md)
**Comprehensive authentication module implementation plan**:
- Database design for User, AuthProvider, RefreshToken
- Architecture and module structure
- JWT authentication strategy
- Guards and decorators
- Integration with existing modules
- OAuth extension design
- Security considerations

**Read this first** for auth module implementation.

### 🗄️ [AUTH_DATABASE_SCHEMA.md](./AUTH_DATABASE_SCHEMA.md)
**Authentication database schema reference**:
- User entity structure
- AuthProvider entity (for OAuth)
- RefreshToken entity
- Relationships and indexes
- Migration SQL
- Sample data

**Reference this** when working with auth entities.

### ✅ [AUTH_IMPLEMENTATION_CHECKLIST.md](./AUTH_IMPLEMENTATION_CHECKLIST.md)
**Step-by-step authentication implementation checklist**:
- Phase-by-phase tasks
- Integration steps
- Testing requirements
- Security review items

**Use this** to track auth implementation progress.

## Quick Start Guide

### 1. Read the Documentation
1. Start with [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for overview
2. Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database design
3. Use [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) as code reference
4. Track progress with [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)

### 2. Setup Environment
```bash
# Install dependencies
pnpm install

# Setup database (PostgreSQL)
# Create database: jobmate_db

# Configure environment variables
# See IMPLEMENTATION_PLAN.md for required env vars
```

### 3. Implementation Order
Follow the phases in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md):
1. **Phase 1**: Setup & Configuration
2. **Phase 2**: Entity Implementation
3. **Phase 3**: DTOs & Validation
4. **Phase 4**: Service Layer
5. **Phase 5**: Controller Layer
6. **Phase 6**: Testing
7. **Phase 7**: Documentation & Polish

### 4. Code Reference
When implementing each component, refer to:
- **Entities**: [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) - Entity Definitions section
- **DTOs**: [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) - DTO Examples section
- **Services**: [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) - Service Examples section
- **Controllers**: [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) - Controller Examples section

## Key Concepts

### Architecture
- **Modular**: One module per domain (candidate, job, job-application)
- **Layered**: Controllers → Services → Entities
- **DRY**: Shared module for common utilities

### Database
- **ORM**: TypeORM (most popular with NestJS, official integration)
- **Database**: PostgreSQL (recommended)
- **Migrations**: TypeORM migrations for schema changes

### Validation
- **Input**: class-validator decorators on DTOs
- **Output**: Type definitions (not DTOs, as per rules)
- **Global**: ValidationPipe for automatic validation

### Testing
- **Unit Tests**: Services and controllers
- **E2E Tests**: Full module integration
- **Coverage**: Target >80% code coverage

## Project Rules Compliance

This implementation follows the NestJS rules defined in `.cursor/rules/nestjs.mdc`:

✅ **Modular architecture** - One module per domain  
✅ **MikroORM** - For data persistence  
✅ **DTOs with class-validator** - For inputs  
✅ **Types (not DTOs)** - For outputs  
✅ **One service per entity**  
✅ **JSDoc documentation** - For public methods  
✅ **Testing** - Unit and E2E tests  
✅ **Smoke test endpoints** - `/admin/test` on each controller  

## Support

For questions or issues:
1. Review the relevant documentation file
2. Check code examples in [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)
3. Refer to [NestJS Documentation](https://docs.nestjs.com/)
4. Refer to [TypeORM Documentation](https://typeorm.io/)

## Next Steps

1. ✅ Review all documentation
2. ✅ Setup development environment
3. ✅ Begin Phase 1 implementation
4. ✅ Follow checklist in [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)

