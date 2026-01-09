# JobMate Refactor Plan

## 📋 Tổng Quan

Tài liệu này mô tả chi tiết các đề xuất refactor cho dự án JobMate, bao gồm impact analysis và lợi ích của từng refactor.

**Ngày tạo:** 2024-12-19  
**Phạm vi:** Backend (NestJS) + Frontend (Nuxt 4)

---

## 🎯 Mục Tiêu Refactor

1. **Giảm code duplication** - Tăng khả năng maintainability
2. **Cải thiện type safety** - Giảm runtime errors
3. **Standardize error handling** - Consistent user experience
4. **Tăng test coverage** - Đảm bảo code quality
5. **Cải thiện developer experience** - Dễ dàng thêm features mới

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

## 🔧 1. Centralize API Client Utility (P0 - High Impact)

### Vấn Đề Hiện Tại
- `useApiClient` chỉ có trong `layers/auth/utils/api-client.ts` nhưng được dùng ở nhiều layers khác
- Import path không consistent: `@auth/utils/api-client` được dùng ở job, candidate, setting layers
- Không có shared location cho common utilities

### Đề Xuất
**Tạo shared API client utility:**
```
web/shared/
  └── api/
      ├── api-client.ts          # Core API client
      ├── api-error-handler.ts   # Centralized error handling
      └── api-types.ts            # Shared API types
```

### Implementation Steps
1. Move `useApiClient` từ `layers/auth/utils/api-client.ts` → `shared/api/api-client.ts`
2. Update tất cả imports từ `@auth/utils/api-client` → `@shared/api/api-client`
3. Extract error handling logic thành separate utility
4. Add retry logic và timeout configuration
5. Add request/response interceptors

### Files Affected
- **Backend API Routes**: ~30 files trong `layers/*/server/api/**/*.ts`
- **Utils**: `layers/*/utils/*-api.ts` files
- **Composables**: Các composables sử dụng API client

### Benefits
✅ **Single source of truth** cho API client  
✅ **Easier maintenance** - chỉ cần update một nơi  
✅ **Consistent error handling** across all API calls  
✅ **Better type safety** với shared types  
✅ **Easier to add features** như retry, caching, logging

### Risks & Mitigation
- **Risk**: Breaking changes nếu có code phụ thuộc vào implementation details
- **Mitigation**: 
  - Giữ backward compatibility trong transition period
  - Update tests trước khi refactor
  - Phased rollout (migrate từng layer một)

### Estimated Effort
- **Time**: 2-3 days
- **Testing**: 1 day
- **Total**: 3-4 days

---

## 🔧 2. Standardize Error Handling (P0 - High Impact)

### Vấn Đề Hiện Tại
- **156 console.log/error statements** trong production code
- Error handling không consistent:
  - Một số return `null` hoặc `[]` khi error
  - Một số throw error
  - Một số chỉ log và continue
- Server API routes có error handling pattern khác nhau
- Không có centralized error logging/monitoring

### Đề Xuất
**Tạo error handling system:**

```
web/shared/
  └── errors/
      ├── error-handler.ts       # Centralized error handler
      ├── error-types.ts         # Error type definitions
      ├── error-logger.ts        # Error logging utility
      └── error-toast.ts          # Error toast notifications
```

### Implementation Steps
1. **Create error types enum:**
   ```typescript
   export enum AppErrorCode {
     NETWORK_ERROR = 'NETWORK_ERROR',
     VALIDATION_ERROR = 'VALIDATION_ERROR',
     NOT_FOUND = 'NOT_FOUND',
     UNAUTHORIZED = 'UNAUTHORIZED',
     // ...
   }
   ```

2. **Create error handler utility:**
   ```typescript
   export function handleApiError(error: unknown): AppError {
     // Centralized error processing
     // Log to monitoring service
     // Return user-friendly error
   }
   ```

3. **Replace console.log/error:**
   - Replace với proper error logging
   - Add error tracking (Sentry, LogRocket, etc.)
   - Create error boundary components

4. **Standardize API error responses:**
   - Ensure all server routes return consistent error format
   - Add error code mapping từ backend errors

### Files Affected
- **All API utilities**: ~10 files
- **Server API routes**: ~40 files
- **Components**: ~30 files với error handling

### Benefits
✅ **Consistent error UX** - users thấy error messages rõ ràng  
✅ **Better debugging** - structured error logs  
✅ **Error tracking** - monitor errors in production  
✅ **Type-safe errors** - compile-time error checking  
✅ **Easier maintenance** - centralized error logic

### Risks & Mitigation
- **Risk**: Có thể miss một số error cases
- **Mitigation**: 
  - Comprehensive testing
  - Gradual migration với feature flags
  - Keep old error handling as fallback

### Estimated Effort
- **Time**: 3-4 days
- **Testing**: 2 days
- **Total**: 5-6 days

---

## 🔧 3. Extract Data Transformation Layer (P1 - Medium Impact)

### Vấn Đề Hiện Tại
- **Data transformation logic bị duplicate** giữa server API routes:
  - `jobs.get.ts` có mapping logic từ backend → frontend Job type
  - `candidates.get.ts` có mapping logic từ backend → frontend Candidate type
  - Similar patterns lặp lại ở nhiều routes
- Transformation logic mixed với business logic
- Khó maintain khi backend API thay đổi

### Đề Xuất
**Tạo data transformation layer:**

```
web/shared/
  └── transformers/
      ├── job-transformer.ts
      ├── candidate-transformer.ts
      ├── application-transformer.ts
      └── base-transformer.ts
```

### Implementation Steps
1. **Create transformer base class:**
   ```typescript
   export abstract class BaseTransformer<TBackend, TFrontend> {
     abstract transform(backend: TBackend): TFrontend
     abstract transformMany(backend: TBackend[]): TFrontend[]
   }
   ```

2. **Create specific transformers:**
   ```typescript
   export class JobTransformer extends BaseTransformer<BackendJob, Job> {
     transform(backend: BackendJob): Job {
       // Centralized transformation logic
     }
   }
   ```

3. **Update server routes** để sử dụng transformers
4. **Add unit tests** cho transformers

### Files Affected
- **Server API routes**: ~15 files với transformation logic
- **Types**: Update type definitions nếu cần

### Benefits
✅ **DRY principle** - no code duplication  
✅ **Easier testing** - test transformation logic separately  
✅ **Easier maintenance** - update transformation ở một nơi  
✅ **Type safety** - compile-time checking  
✅ **Reusability** - có thể dùng ở nhiều nơi

### Risks & Mitigation
- **Risk**: Có thể over-engineer nếu transformation đơn giản
- **Mitigation**: 
  - Chỉ extract khi có duplication thực sự
  - Keep simple transformations inline

### Estimated Effort
- **Time**: 2-3 days
- **Testing**: 1 day
- **Total**: 3-4 days

---

## 🔧 4. Consolidate Type Definitions (P1 - Medium Impact)

### Vấn Đề Hiện Tại
- **Duplicate type definitions:**
  - `Job` type có trong `layers/job/types/job.ts` và `layers/matching/types/matching.ts`
  - `ApiResponse` type có 2 versions (web/types và backend/src/shared/types)
- Types không được share tốt giữa layers
- Inconsistent type naming conventions

### Đề Xuất
**Tạo shared types structure:**

```
web/shared/
  └── types/
      ├── api-response.ts        # Already exists, consolidate
      ├── common.ts              # Common types (Pagination, etc.)
      └── entities/
          ├── job.ts             # Shared Job type
          ├── candidate.ts       # Shared Candidate type
          └── application.ts     # Shared Application type
```

### Implementation Steps
1. **Audit all type definitions:**
   - List tất cả types trong mỗi layer
   - Identify duplicates và inconsistencies
   - Create migration plan

2. **Create shared types:**
   - Move common types to `shared/types`
   - Update imports across codebase
   - Ensure type compatibility

3. **Create type mapping:**
   - Backend types → Frontend types
   - Document type transformations

4. **Update layer types:**
   - Layers chỉ export types specific to that layer
   - Import shared types từ `@shared/types`

### Files Affected
- **All type files**: ~20 files
- **All files using types**: ~100+ files

### Benefits
✅ **Single source of truth** cho types  
✅ **Type consistency** across codebase  
✅ **Easier refactoring** - change type ở một nơi  
✅ **Better IDE support** - accurate autocomplete  
✅ **Reduced bundle size** - no duplicate type definitions

### Risks & Mitigation
- **Risk**: Breaking changes nếu types không compatible
- **Mitigation**: 
  - Use TypeScript's type system để catch issues
  - Gradual migration
  - Comprehensive type checking

### Estimated Effort
- **Time**: 2-3 days
- **Testing**: 1 day (type checking)
- **Total**: 3-4 days

---

## 🔧 5. Create Base API Route Handler (P1 - Medium Impact)

### Vấn Đề Hiện Tại
- **Server API routes có pattern lặp lại:**
  - Error handling logic giống nhau
  - Query parameter parsing
  - Authorization header extraction
  - Response formatting
- Mỗi route tự implement các patterns này
- Khó maintain và dễ miss edge cases

### Đề Xuất
**Tạo base route handler utilities:**

```
web/shared/
  └── server/
      ├── route-handler.ts       # Base route handler
      ├── query-parser.ts        # Query parameter utilities
      ├── auth-utils.ts          # Auth header utilities
      └── response-formatter.ts  # Response formatting
```

### Implementation Steps
1. **Create base route handler:**
   ```typescript
   export async function handleApiRoute<T>(
     event: H3Event,
     handler: (params: RouteParams) => Promise<T>
   ): Promise<ApiResponse<T>> {
     try {
       // Extract auth header
       // Parse query params
       // Call handler
       // Format response
     } catch (error) {
       // Handle errors
     }
   }
   ```

2. **Create query parser utility:**
   ```typescript
   export function parseQueryParams<T>(
     event: H3Event,
     schema: z.ZodSchema<T>
   ): T {
     // Parse and validate query params
   }
   ```

3. **Refactor existing routes** để sử dụng base handler
4. **Add tests** cho base handlers

### Files Affected
- **Server API routes**: ~40 files
- **New shared utilities**: 4-5 files

### Benefits
✅ **DRY principle** - no repeated code  
✅ **Consistent behavior** - all routes follow same pattern  
✅ **Easier to add features** - add logging, validation, etc. ở một nơi  
✅ **Better error handling** - centralized error processing  
✅ **Easier testing** - test base handler once

### Risks & Mitigation
- **Risk**: Có thể over-abstract nếu routes quá khác nhau
- **Mitigation**: 
  - Keep base handler flexible
  - Allow routes to override behavior khi cần
  - Start với common patterns, expand gradually

### Estimated Effort
- **Time**: 2-3 days
- **Testing**: 1-2 days
- **Total**: 3-5 days

---

## 🔧 6. Improve Testing Infrastructure (P1 - High Impact)

### Vấn Đề Hiện Tại
- **Chỉ có 1 test file** (`backend/src/app.controller.spec.ts`)
- **No test coverage** cho frontend
- **No E2E tests**
- **No integration tests**
- Khó verify refactors không break existing functionality

### Đề Xuất
**Setup comprehensive testing:**

```
Backend:
  src/
    └── **/*.spec.ts           # Unit tests
  test/
    └── **/*.e2e-spec.ts      # E2E tests

Frontend:
  web/
    └── tests/
        ├── unit/             # Unit tests
        ├── integration/      # Integration tests
        └── e2e/              # E2E tests (Playwright)
```

### Implementation Steps
1. **Backend Testing:**
   - Setup Jest configuration
   - Create test utilities và mocks
   - Write unit tests cho services
   - Write E2E tests cho controllers
   - Setup test coverage reporting

2. **Frontend Testing:**
   - Setup Vitest cho unit tests
   - Setup Playwright cho E2E tests
   - Create test utilities và composables
   - Write tests cho critical paths

3. **CI/CD Integration:**
   - Add test step vào CI pipeline
   - Enforce minimum coverage (80%)
   - Block PRs nếu tests fail

### Files Affected
- **New test files**: ~50+ files
- **CI/CD config**: GitHub Actions workflows
- **Package.json**: Add test scripts

### Benefits
✅ **Confidence in refactoring** - tests catch breaking changes  
✅ **Documentation** - tests serve as usage examples  
✅ **Regression prevention** - catch bugs before production  
✅ **Better code quality** - force better design  
✅ **Faster development** - catch issues early

### Risks & Mitigation
- **Risk**: Time-consuming để write tests
- **Mitigation**: 
  - Start với critical paths
  - Write tests incrementally
  - Focus on high-value tests first

### Estimated Effort
- **Time**: 5-7 days (initial setup + critical tests)
- **Ongoing**: Continuous improvement
- **Total**: 5-7 days initial + ongoing

---

## 🔧 7. Remove Console Statements (P2 - Low Impact)

### Vấn Đề Hiện Tại
- **156 console.log/error statements** trong production code
- Console statements không được remove trong production build
- Không có structured logging
- Debug information có thể leak ra production

### Đề Xuất
**Replace với proper logging:**

```
web/shared/
  └── logging/
      ├── logger.ts            # Logger utility
      └── log-levels.ts        # Log level definitions
```

### Implementation Steps
1. **Create logger utility:**
   ```typescript
   export const logger = {
     debug: (message: string, data?: any) => { /* ... */ },
     info: (message: string, data?: any) => { /* ... */ },
     warn: (message: string, data?: any) => { /* ... */ },
     error: (message: string, error?: Error) => { /* ... */ },
   }
   ```

2. **Replace console statements:**
   - Find và replace console.log → logger.debug/info
   - Replace console.error → logger.error
   - Replace console.warn → logger.warn

3. **Configure logging:**
   - Development: log to console
   - Production: log to monitoring service (Sentry, etc.)
   - Remove console statements từ production build

### Files Affected
- **All files với console statements**: ~40 files

### Benefits
✅ **Structured logging** - easier to search và filter  
✅ **Production safety** - no debug logs in production  
✅ **Better monitoring** - integrate với logging services  
✅ **Performance** - remove console statements từ production build

### Risks & Mitigation
- **Risk**: Có thể miss một số console statements
- **Mitigation**: 
  - Use ESLint rule để prevent console statements
  - Automated search và replace
  - Code review

### Estimated Effort
- **Time**: 1-2 days
- **Testing**: 0.5 days
- **Total**: 1.5-2.5 days

---

## 🔧 8. Create Shared Form Components (P2 - Medium Impact)

### Vấn Đề Hiện Tại
- **Form components có code duplication:**
  - Similar form field patterns
  - Similar validation logic
  - Similar error handling
- Dynamic form component exists nhưng không được dùng consistently
- Inconsistent form styling và behavior

### Đề Xuất
**Enhance và standardize form components:**

```
web/shared/
  └── forms/
      ├── form-field.vue        # Standardized form field
      ├── form-section.vue      # Form section wrapper
      ├── form-actions.vue      # Form action buttons
      └── form-utils.ts         # Form utilities
```

### Implementation Steps
1. **Audit existing forms:**
   - Identify common patterns
   - List duplicated code
   - Create component spec

2. **Create shared form components:**
   - Build reusable form field component
   - Add form validation utilities
   - Create form layout components

3. **Migrate existing forms:**
   - Update forms để sử dụng shared components
   - Ensure consistent styling
   - Maintain backward compatibility

### Files Affected
- **Form components**: ~20 files
- **New shared components**: 3-4 files

### Benefits
✅ **Consistent UX** - all forms look và behave the same  
✅ **Less code** - reuse components  
✅ **Easier maintenance** - update form behavior ở một nơi  
✅ **Better accessibility** - standardized form fields

### Risks & Mitigation
- **Risk**: Có thể over-abstract nếu forms quá khác nhau
- **Mitigation**: 
  - Keep components flexible
  - Allow customization khi cần
  - Gradual migration

### Estimated Effort
- **Time**: 2-3 days
- **Testing**: 1 day
- **Total**: 3-4 days

---

## 🔧 9. Implement Request/Response Interceptors (P2 - Low Impact)

### Vấn Đề Hiện Tại
- **No centralized request/response handling:**
  - Each API call tự handle errors
  - No request logging
  - No response caching
  - No retry logic
- Khó implement features như:
  - Request cancellation
  - Request deduplication
  - Response caching
  - Automatic retry

### Đề Xuất
**Add interceptors cho API client:**

```typescript
// Request interceptor
apiClient.interceptors.request.use((config) => {
  // Add auth token
  // Add request ID
  // Log request
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response
    // Cache response
    return response
  },
  (error) => {
    // Handle error
    // Retry logic
    // Transform error
    return Promise.reject(error)
  }
)
```

### Implementation Steps
1. **Enhance API client** với interceptor support
2. **Add request interceptors:**
   - Auth token injection
   - Request logging
   - Request ID generation

3. **Add response interceptors:**
   - Error transformation
   - Response caching
   - Retry logic

4. **Add utilities:**
   - Request cancellation
   - Request deduplication
   - Cache management

### Files Affected
- **API client**: 1 file (major update)
- **API utilities**: May need updates

### Benefits
✅ **Centralized logic** - request/response handling ở một nơi  
✅ **Easier to add features** - caching, retry, etc.  
✅ **Better debugging** - request/response logging  
✅ **Performance** - request deduplication và caching

### Risks & Mitigation
- **Risk**: Có thể add complexity
- **Mitigation**: 
  - Keep interceptors simple
  - Document behavior clearly
  - Add tests

### Estimated Effort
- **Time**: 2-3 days
- **Testing**: 1 day
- **Total**: 3-4 days

---

## 🔧 10. Add API Response Caching (P3 - Low Impact)

### Vấn Đề Hiện Tại
- **No response caching:**
  - Mỗi API call fetch từ server
  - Unnecessary network requests
  - Slower UI updates
- Không có cache invalidation strategy

### Đề Xuất
**Implement response caching:**

```typescript
// Cache configuration
const cacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // Max 100 cached responses
  strategy: 'stale-while-revalidate'
}
```

### Implementation Steps
1. **Create cache utility:**
   - In-memory cache
   - Cache key generation
   - TTL management

2. **Integrate với API client:**
   - Add cache interceptor
   - Cache GET requests
   - Invalidate cache on POST/PUT/DELETE

3. **Add cache management:**
   - Cache size limits
   - Cache invalidation
   - Cache statistics

### Files Affected
- **API client**: 1 file
- **New cache utility**: 1-2 files

### Benefits
✅ **Performance** - faster UI updates  
✅ **Reduced server load** - fewer API calls  
✅ **Better UX** - instant data display  
✅ **Offline support** - cached data available

### Risks & Mitigation
- **Risk**: Stale data nếu cache không invalidate đúng
- **Mitigation**: 
  - Careful cache invalidation
  - TTL configuration
  - Manual refresh option

### Estimated Effort
- **Time**: 2-3 days
- **Testing**: 1 day
- **Total**: 3-4 days

---

## 📈 Refactor Priority Matrix

| Refactor | Priority | Impact | Effort | ROI | Recommended Order |
|----------|----------|--------|--------|-----|-------------------|
| 1. Centralize API Client | P0 | High | 3-4 days | ⭐⭐⭐⭐⭐ | 1 |
| 2. Standardize Error Handling | P0 | High | 5-6 days | ⭐⭐⭐⭐⭐ | 2 |
| 3. Extract Data Transformers | P1 | Medium | 3-4 days | ⭐⭐⭐⭐ | 3 |
| 4. Consolidate Types | P1 | Medium | 3-4 days | ⭐⭐⭐⭐ | 4 |
| 5. Base Route Handler | P1 | Medium | 3-5 days | ⭐⭐⭐⭐ | 5 |
| 6. Testing Infrastructure | P1 | High | 5-7 days | ⭐⭐⭐⭐⭐ | 6 |
| 7. Remove Console Statements | P2 | Low | 1.5-2.5 days | ⭐⭐⭐ | 7 |
| 8. Shared Form Components | P2 | Medium | 3-4 days | ⭐⭐⭐ | 8 |
| 9. Request/Response Interceptors | P2 | Low | 3-4 days | ⭐⭐⭐ | 9 |
| 10. API Response Caching | P3 | Low | 3-4 days | ⭐⭐ | 10 |

---

## 🚀 Recommended Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Focus: Critical infrastructure**
1. Centralize API Client (Refactor #1)
2. Standardize Error Handling (Refactor #2)
3. Setup Testing Infrastructure (Refactor #6) - Start với critical paths

**Benefits:**
- Solid foundation cho các refactors sau
- Easier to test và verify changes
- Consistent patterns across codebase

### Phase 2: Data Layer (Weeks 3-4)
**Focus: Data handling và types**
1. Extract Data Transformers (Refactor #3)
2. Consolidate Types (Refactor #4)
3. Base Route Handler (Refactor #5)

**Benefits:**
- Cleaner data flow
- Better type safety
- Easier to maintain

### Phase 3: Polish (Weeks 5-6)
**Focus: Code quality và UX**
1. Remove Console Statements (Refactor #7)
2. Shared Form Components (Refactor #8)
3. Request/Response Interceptors (Refactor #9)

**Benefits:**
- Better code quality
- Consistent UX
- Enhanced features

### Phase 4: Optimization (Week 7+)
**Focus: Performance**
1. API Response Caching (Refactor #10)
2. Additional optimizations based on metrics

**Benefits:**
- Better performance
- Reduced server load

---

## 📊 Success Metrics

### Code Quality Metrics
- **Code Duplication**: Giảm từ ~30% → <10%
- **Test Coverage**: Tăng từ ~0% → >80%
- **Console Statements**: Giảm từ 156 → 0
- **Type Safety**: 100% type coverage

### Developer Experience Metrics
- **Time to add new API endpoint**: Giảm 50%
- **Time to add new form**: Giảm 40%
- **Bug rate**: Giảm 30%
- **Code review time**: Giảm 25%

### Performance Metrics
- **API response time**: Giảm 20% (với caching)
- **Bundle size**: Giảm 5-10% (với tree-shaking)
- **Build time**: Giảm 10-15%

---

## ⚠️ Risks & Mitigation Strategies

### General Risks

1. **Breaking Changes**
   - **Risk**: Refactors có thể break existing functionality
   - **Mitigation**: 
     - Comprehensive testing
     - Phased rollout
     - Feature flags
     - Rollback plan

2. **Time Overrun**
   - **Risk**: Refactors có thể take longer than estimated
   - **Mitigation**: 
     - Prioritize high-ROI refactors
     - Break down into smaller tasks
     - Regular progress reviews

3. **Team Resistance**
   - **Risk**: Team có thể resist changes
   - **Mitigation**: 
     - Clear communication về benefits
     - Training sessions
     - Gradual adoption

4. **Technical Debt**
   - **Risk**: Refactors có thể introduce new technical debt
   - **Mitigation**: 
     - Code reviews
     - Documentation
     - Follow best practices

---

## 📝 Next Steps

1. **Review và Approve Plan**
   - Team review refactor plan
   - Prioritize based on business needs
   - Adjust timeline nếu cần

2. **Create Detailed Tasks**
   - Break down mỗi refactor thành specific tasks
   - Assign owners
   - Set deadlines

3. **Setup Tracking**
   - Create GitHub issues/projects
   - Setup progress tracking
   - Regular status updates

4. **Start Implementation**
   - Begin với Phase 1 refactors
   - Follow recommended order
   - Document learnings

---

## 📚 References

- [Nuxt 4 Documentation](https://nuxt.com/)
- [NestJS Best Practices](https://docs.nestjs.com/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-19  
**Maintained By**: Development Team
