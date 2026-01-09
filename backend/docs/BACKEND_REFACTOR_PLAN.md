# Backend Refactor Plan

## 📋 Tổng Quan

Tài liệu này mô tả chi tiết các đề xuất refactor cho backend NestJS của JobMate, bao gồm impact analysis và lợi ích của từng refactor.

**Ngày tạo:** 2024-12-19  
**Phạm vi:** Backend (NestJS + TypeORM + PostgreSQL)

---

## 🎯 Mục Tiêu Refactor

1. **Giảm code duplication** - Tăng khả năng maintainability
2. **Standardize patterns** - Consistent code structure
3. **Improve error handling** - Better error messages và logging
4. **Enhance type safety** - Reduce runtime errors
5. **Optimize database queries** - Better performance
6. **Improve testability** - Easier to write tests

---

## 📊 Phân Loại Refactor

### Priority Levels:
- **P0 (Critical)**: Ảnh hưởng trực tiếp đến stability và maintainability
- **P1 (High)**: Cải thiện đáng kể code quality và developer experience
- **P2 (Medium)**: Cải thiện tốt nhưng không urgent
- **P3 (Low)**: Nice to have, có thể làm sau

### Impact Levels:
- **High**: Thay đổi nhiều files, cần testing kỹ
- **Medium**: Thay đổi một số files, moderate testing
- **Low**: Thay đổi ít files, minimal testing

---

## 🔧 1. Extract Base Service Pattern (P0 - High Impact)

### Vấn Đề Hiện Tại
- **Code Duplication**: CandidateEducationService, CandidateSkillService, CandidateWorkExperienceService, CandidateProjectService có pattern giống nhau
- **Duplicate Logic**: 
  - Verify candidate exists và belongs to user (repeated 4+ times)
  - findOne với ownership check (repeated 4+ times)
  - findAllByCandidate với ownership check (repeated 4+ times)
  - update và delete với ownership check (repeated 4+ times)

### Đề Xuất
**Tạo base service class:**
```
backend/src/shared/services/
  └── base-entity.service.ts    # Abstract base service
  └── base-candidate-entity.service.ts  # Base for candidate-related entities
```

**Pattern:**
```typescript
export abstract class BaseCandidateEntityService<TEntity, TCreateDto, TUpdateDto> {
  // Common methods:
  // - verifyCandidateOwnership()
  // - findOneWithOwnershipCheck()
  // - findAllByCandidateWithOwnershipCheck()
  // - createWithOwnershipCheck()
  // - updateWithOwnershipCheck()
  // - deleteWithOwnershipCheck()
}
```

### Impact Analysis
- **Files Affected**: 4 services (education, skill, work-experience, project)
- **Code Reduction**: ~300+ lines of duplicate code
- **Benefits**: 
  - Single source of truth cho ownership logic
  - Easier to maintain và update
  - Consistent error messages
- **Risks**: 
  - Need careful testing
  - May need to adjust existing code

### Implementation Steps
1. Create `shared/services/base-candidate-entity.service.ts`
2. Extract common ownership verification logic
3. Extract common CRUD patterns
4. Refactor CandidateEducationService to extend base
5. Refactor CandidateSkillService to extend base
6. Refactor CandidateWorkExperienceService to extend base
7. Refactor CandidateProjectService to extend base
8. Update tests

**Estimated Effort**: 4-6 hours

---

## 🔧 2. Centralize Authorization Logic (P0 - High Impact)

### Vấn Đề Hiện Tại
- **Duplicate Ownership Checks**: Logic check ownership được duplicate trong nhiều services
- **Inconsistent Error Messages**: Một số dùng "Access denied", một số dùng "You can only..."
- **No Reusable Guards**: Không có guard để check ownership

### Đề Xuất
**Tạo ownership guard và helper:**
```
backend/src/shared/guards/
  └── ownership.guard.ts        # Guard để check ownership
backend/src/shared/decorators/
  └── check-ownership.decorator.ts  # Decorator để check ownership
backend/src/shared/utils/
  └── ownership.utils.ts        # Helper functions
```

**Pattern:**
```typescript
// Guard
@UseGuards(OwnershipGuard)
@CheckOwnership('candidate', 'userId')
async updateCandidate(...) { ... }

// Helper
async verifyOwnership(entity: Entity, userId: string, entityName: string): Promise<void>
```

### Impact Analysis
- **Files Affected**: All services với ownership checks
- **Code Reduction**: ~100+ lines
- **Benefits**: 
  - Consistent authorization logic
  - Reusable guards
  - Better error messages
- **Risks**: 
  - Need to update all controllers
  - May need custom decorators

### Implementation Steps
1. Create ownership utilities
2. Create ownership guard
3. Create ownership decorator
4. Update services to use utilities
5. Update controllers to use guards
6. Update tests

**Estimated Effort**: 3-4 hours

---

## 🔧 3. Extract Query Builder Patterns (P1 - Medium Impact)

### Vấn Đề Hiện Tại
- **Duplicate Pagination Logic**: JobService và CandidateService có pagination logic tương tự
- **Duplicate Query Building**: Similar patterns cho filtering và sorting
- **No Reusable Query Builder**: Mỗi service tự implement query builder

### Đề Xuất
**Tạo query builder utilities:**
```
backend/src/shared/utils/
  └── query-builder.utils.ts   # Common query builder helpers
  └── pagination.utils.ts       # Pagination helpers
```

**Pattern:**
```typescript
// Pagination helper
export function applyPagination<T>(
  qb: SelectQueryBuilder<T>,
  page: number,
  limit: number
): SelectQueryBuilder<T>

// Filter helper
export function applySearchFilter<T>(
  qb: SelectQueryBuilder<T>,
  search: string,
  fields: string[]
): SelectQueryBuilder<T>
```

### Impact Analysis
- **Files Affected**: JobService, CandidateService, và các services khác với pagination
- **Code Reduction**: ~150+ lines
- **Benefits**: 
  - Consistent pagination
  - Reusable query patterns
  - Easier to add new filters
- **Risks**: 
  - Need to test pagination carefully
  - May need to adjust existing queries

### Implementation Steps
1. Create query builder utilities
2. Create pagination utilities
3. Refactor JobService.findAll()
4. Refactor CandidateService.findAll()
5. Update other services với pagination
6. Update tests

**Estimated Effort**: 3-4 hours

---

## 🔧 4. Standardize Error Handling (P1 - Medium Impact)

### Vấn Đề Hiện Tại
- **Inconsistent Error Messages**: Một số dùng "not found", một số dùng "Not found"
- **No Error Codes**: Không có error codes để frontend handle
- **Limited Error Context**: Error messages không có đủ context
- **Console.log Statements**: Có 4 console.log statements nên replace với proper logger

### Đề Xuất
**Cải thiện error handling:**
```
backend/src/shared/exceptions/
  └── custom-exceptions.ts     # Custom exceptions với error codes
  └── exception-factory.ts     # Factory để create exceptions
backend/src/shared/logging/
  └── logger.service.ts         # Centralized logger
```

**Pattern:**
```typescript
// Custom exception với error code
export class EntityNotFoundException extends HttpException {
  constructor(entityName: string, id: string) {
    super(
      {
        code: 'ENTITY_NOT_FOUND',
        message: `${entityName} with ID ${id} not found`,
        entityName,
        id,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

// Logger service
@Injectable()
export class LoggerService {
  error(message: string, context?: string, trace?: string): void
  warn(message: string, context?: string): void
  log(message: string, context?: string): void
}
```

### Impact Analysis
- **Files Affected**: All services và controllers
- **Code Reduction**: Minimal (thay đổi structure)
- **Benefits**: 
  - Consistent error messages
  - Error codes cho frontend
  - Better logging
  - Easier debugging
- **Risks**: 
  - Frontend cần update để handle error codes
  - Need to update all exception throws

### Implementation Steps
1. Create custom exceptions
2. Create logger service
3. Replace console.log với logger
4. Update ApiExceptionFilter để handle error codes
5. Update services để use custom exceptions
6. Update tests

**Estimated Effort**: 4-5 hours

---

## 🔧 5. Create Base DTOs và Validation (P1 - Medium Impact)

### Vấn Đề Hiện Tại
- **Duplicate Validation**: Các DTOs có validation patterns tương tự
- **No Base DTOs**: Không có base DTOs cho common fields
- **Inconsistent Validation**: Một số DTOs có validation, một số không

### Đề Xuất
**Tạo base DTOs:**
```
backend/src/shared/dto/
  └── base-pagination.dto.ts   # Base pagination DTO
  └── base-query.dto.ts        # Base query DTO với common filters
  └── base-create.dto.ts       # Base create DTO
  └── base-update.dto.ts       # Base update DTO
```

**Pattern:**
```typescript
// Base pagination DTO
export class BasePaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Base query DTO
export class BaseQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
```

### Impact Analysis
- **Files Affected**: All DTOs
- **Code Reduction**: ~100+ lines
- **Benefits**: 
  - Consistent validation
  - Reusable base classes
  - Easier to maintain
- **Risks**: 
  - Need to update all DTOs
  - May need to adjust validation rules

### Implementation Steps
1. Create base DTOs
2. Update QueryJobDto to extend BaseQueryDto
3. Update QueryCandidateDto to extend BaseQueryDto
4. Update other query DTOs
5. Update tests

**Estimated Effort**: 2-3 hours

---

## 🔧 6. Optimize Database Queries (P2 - Medium Impact)

### Vấn Đề Hiện Tại
- **N+1 Queries**: Một số queries có thể gây N+1 problem
- **Missing Relations**: Một số queries không load relations cần thiết
- **No Query Optimization**: Không có query optimization strategies

### Đề Xuất
**Cải thiện queries:**
- Add relations loading trong queries
- Use query builder với proper joins
- Add indexes cho frequently queried fields
- Consider using DataLoader pattern cho N+1 problems

### Impact Analysis
- **Files Affected**: All services với database queries
- **Code Reduction**: Minimal
- **Benefits**: 
  - Better performance
  - Reduced database load
  - Faster response times
- **Risks**: 
  - Need careful testing
  - May need database migrations

### Implementation Steps
1. Analyze queries với N+1 problems
2. Add relations loading
3. Optimize query builders
4. Add database indexes
5. Performance testing

**Estimated Effort**: 4-6 hours

---

## 🔧 7. Create Base Repository Pattern (P2 - Low Impact)

### Vấn Đề Hiện Tại
- **No Base Repository**: Mỗi service tự inject repository
- **Duplicate Repository Methods**: Common methods như findOneOrFail được duplicate

### Đề Xuất
**Tạo base repository:**
```
backend/src/shared/repositories/
  └── base.repository.ts        # Base repository với common methods
```

**Pattern:**
```typescript
export class BaseRepository<T> extends Repository<T> {
  async findOneOrFail(id: string): Promise<T> {
    const entity = await this.findOne({ where: { id } });
    if (!entity) {
      throw new EntityNotFoundException(this.metadata.name, id);
    }
    return entity;
  }
}
```

### Impact Analysis
- **Files Affected**: All services
- **Code Reduction**: ~50+ lines
- **Benefits**: 
  - Reusable repository methods
  - Consistent error handling
- **Risks**: 
  - Need to update all repositories
  - May need custom repository pattern

### Implementation Steps
1. Create base repository
2. Update repositories to extend base
3. Update services to use base methods
4. Update tests

**Estimated Effort**: 2-3 hours

---

## 🔧 8. Add Request Logging Middleware (P2 - Low Impact)

### Vấn Đề Hiện Tại
- **No Request Logging**: Không có logging cho incoming requests
- **No Performance Monitoring**: Không track request duration
- **No Error Tracking**: Không track errors với context

### Đề Xuất
**Tạo logging middleware:**
```
backend/src/shared/middleware/
  └── request-logging.middleware.ts  # Log requests và responses
```

**Features:**
- Log request method, URL, headers
- Log response status và duration
- Log errors với stack trace
- Optional: Integrate với logging service (Winston, Pino)

### Impact Analysis
- **Files Affected**: Main.ts và app module
- **Code Reduction**: Minimal
- **Benefits**: 
  - Better debugging
  - Performance monitoring
  - Error tracking
- **Risks**: 
  - May impact performance nếu log quá nhiều
  - Need to configure log levels

### Implementation Steps
1. Create request logging middleware
2. Add middleware to app
3. Configure log levels
4. Optional: Integrate với external logging service
5. Test logging

**Estimated Effort**: 2-3 hours

---

## 🔧 9. Standardize API Response Types (P2 - Low Impact)

### Vấn Đề Hiện Tại
- **Inconsistent Responses**: Một số endpoints return data trực tiếp, một số wrap trong ApiResponse
- **ApiResponseInterceptor**: Đã có nhưng có thể cải thiện

### Đề Xuất
**Cải thiện ApiResponseInterceptor:**
- Ensure tất cả responses follow standard format
- Add response metadata helpers
- Improve error response formatting

### Impact Analysis
- **Files Affected**: ApiResponseInterceptor và controllers
- **Code Reduction**: Minimal
- **Benefits**: 
  - Consistent API responses
  - Better frontend integration
- **Risks**: 
  - Frontend có thể cần update
  - Need to test all endpoints

### Implementation Steps
1. Review ApiResponseInterceptor
2. Ensure all responses use interceptor
3. Add response metadata helpers
4. Update tests

**Estimated Effort**: 1-2 hours

---

## 🔧 10. Add Unit Tests (P3 - Low Impact)

### Vấn Đề Hiện Tại
- **Limited Test Coverage**: Có test files nhưng coverage có thể thấp
- **No Test Utilities**: Không có test utilities và factories

### Đề Xuất
**Cải thiện testing:**
- Add test utilities và factories
- Increase test coverage
- Add integration tests

### Impact Analysis
- **Files Affected**: Test files
- **Code Reduction**: None (add code)
- **Benefits**: 
  - Better code quality
  - Easier refactoring
  - Catch bugs early
- **Risks**: 
  - Time consuming
  - Need to maintain tests

### Implementation Steps
1. Create test utilities
2. Create entity factories
3. Add unit tests cho services
4. Add integration tests cho controllers
5. Set up coverage reporting

**Estimated Effort**: 8-12 hours

---

## 📊 Summary

### Priority Breakdown

**P0 (Critical) - Must Do:**
1. Extract Base Service Pattern
2. Centralize Authorization Logic

**P1 (High) - Should Do:**
3. Extract Query Builder Patterns
4. Standardize Error Handling
5. Create Base DTOs và Validation

**P2 (Medium) - Nice to Have:**
6. Optimize Database Queries
7. Create Base Repository Pattern
8. Add Request Logging Middleware
9. Standardize API Response Types

**P3 (Low) - Future:**
10. Add Unit Tests

### Estimated Total Effort
- **P0**: 7-10 hours
- **P1**: 9-12 hours
- **P2**: 9-14 hours
- **P3**: 8-12 hours
- **Total**: 33-48 hours

### Recommended Implementation Phases

**Phase 1 (Week 1) - Critical:**
- Refactor #1: Extract Base Service Pattern
- Refactor #2: Centralize Authorization Logic

**Phase 2 (Week 2) - High Priority:**
- Refactor #3: Extract Query Builder Patterns
- Refactor #4: Standardize Error Handling
- Refactor #5: Create Base DTOs

**Phase 3 (Week 3) - Medium Priority:**
- Refactor #6: Optimize Database Queries
- Refactor #7: Create Base Repository Pattern
- Refactor #8: Add Request Logging Middleware

**Phase 4 (Future) - Low Priority:**
- Refactor #9: Standardize API Response Types
- Refactor #10: Add Unit Tests

---

**Last Updated**: 2024-12-19
