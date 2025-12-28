# Auth Module Implementation Checklist

## Phase 1: Core Authentication (Email/Password)

### Dependencies Installation
- [ ] Install @nestjs/jwt
- [ ] Install @nestjs/passport
- [ ] Install passport
- [ ] Install passport-jwt
- [ ] Install bcrypt
- [ ] Install @types/passport-jwt
- [ ] Install @types/bcrypt

### Database Setup
- [ ] Create User entity
- [ ] Create AuthProvider entity (for future OAuth)
- [ ] Create RefreshToken entity
- [ ] Create database migration
- [ ] Run migration

### User Entity
- [ ] Create user.entity.ts
- [ ] Add all properties (email, password_hash, profile fields)
- [ ] Add indexes (email, role)
- [ ] Add enums (UserRole)
- [ ] Add validation decorators
- [ ] Test entity creation

### Password Service
- [ ] Create password.service.ts
- [ ] Implement hashPassword()
- [ ] Implement comparePassword()
- [ ] Add password strength validation
- [ ] Write unit tests

### Auth Service
- [ ] Create auth.service.ts
- [ ] Implement register()
- [ ] Implement login()
- [ ] Implement validateUser()
- [ ] Implement refreshToken()
- [ ] Implement logout()
- [ ] Implement getProfile()
- [ ] Implement updateProfile()
- [ ] Implement changePassword()
- [ ] Add error handling
- [ ] Write unit tests

### JWT Strategy
- [ ] Create jwt.strategy.ts
- [ ] Configure JWT extraction
- [ ] Implement validate() method
- [ ] Add user lookup
- [ ] Handle token expiration

### JWT Module Configuration
- [ ] Configure JwtModule in auth.module.ts
- [ ] Set JWT secret from config
- [ ] Set token expiration
- [ ] Set refresh token expiration

### Auth Controller
- [ ] Create auth.controller.ts
- [ ] Implement POST /auth/register
- [ ] Implement POST /auth/login
- [ ] Implement POST /auth/refresh
- [ ] Implement POST /auth/logout
- [ ] Implement GET /auth/me
- [ ] Implement PATCH /auth/profile
- [ ] Implement PATCH /auth/change-password
- [ ] Add Swagger decorators
- [ ] Add error handling
- [ ] Write unit tests

### DTOs
- [ ] Create register.dto.ts
- [ ] Create login.dto.ts
- [ ] Create refresh-token.dto.ts
- [ ] Create change-password.dto.ts
- [ ] Create update-profile.dto.ts
- [ ] Add validation decorators
- [ ] Add Swagger decorators

### Response Types
- [ ] Create auth-response.type.ts
- [ ] Create jwt-payload.type.ts
- [ ] Create user-response.type.ts

## Phase 2: Guards & Decorators

### JWT Auth Guard
- [ ] Create jwt-auth.guard.ts
- [ ] Extend AuthGuard('jwt')
- [ ] Handle authentication errors
- [ ] Test guard functionality

### Public Decorator
- [ ] Create public.decorator.ts
- [ ] Create SetMetadata decorator
- [ ] Update JWT guard to skip public routes
- [ ] Test public routes

### Current User Decorator
- [ ] Create current-user.decorator.ts
- [ ] Extract user from request
- [ ] Add type safety
- [ ] Test decorator

### Roles Guard (Optional)
- [ ] Create roles.guard.ts
- [ ] Create roles.decorator.ts
- [ ] Implement role checking
- [ ] Test role-based access

### Global Guard Setup
- [ ] Register JWT guard globally in core module
- [ ] Configure public routes
- [ ] Test global protection

## Phase 3: Integration with Existing Modules

### Candidate Module Integration
- [ ] Add userId field to Candidate entity
- [ ] Create migration for userId
- [ ] Update CandidateService to filter by user
- [ ] Add @UseGuards(JwtAuthGuard) to CandidateController
- [ ] Add @CurrentUser() decorator where needed
- [ ] Update DTOs if needed
- [ ] Test protected endpoints

### Job Module Integration
- [ ] Add createdBy field to Job entity (optional)
- [ ] Create migration for createdBy
- [ ] Update JobService to filter by creator
- [ ] Add @UseGuards(JwtAuthGuard) to JobController
- [ ] Make GET /jobs public (viewing)
- [ ] Protect POST/PATCH/DELETE /jobs
- [ ] Test protected endpoints

### JobApplication Module Integration
- [ ] Ensure applications require authentication
- [ ] Link applications to authenticated user
- [ ] Update createApplication() to use current user
- [ ] Add @UseGuards(JwtAuthGuard) to JobApplicationController
- [ ] Filter applications by current user
- [ ] Test protected endpoints

## Phase 4: Refresh Token Implementation

### Refresh Token Entity
- [ ] Create refresh-token.entity.ts
- [ ] Add all properties
- [ ] Add indexes
- [ ] Add relationships

### Refresh Token Service
- [ ] Create refresh-token.service.ts
- [ ] Implement generateToken()
- [ ] Implement validateToken()
- [ ] Implement revokeToken()
- [ ] Implement revokeAllUserTokens()
- [ ] Implement cleanupExpiredTokens()
- [ ] Write unit tests

### Refresh Token Integration
- [ ] Update login() to generate refresh token
- [ ] Update refreshToken() endpoint
- [ ] Update logout() to revoke token
- [ ] Add token rotation (optional)
- [ ] Test refresh flow

## Phase 5: Environment Configuration

### Environment Variables
- [ ] Add JWT_SECRET to .env.example
- [ ] Add JWT_EXPIRES_IN to .env.example
- [ ] Add JWT_REFRESH_EXPIRES_IN to .env.example
- [ ] Add BCRYPT_ROUNDS to .env.example
- [ ] Update .env file
- [ ] Document environment variables

### Config Validation
- [ ] Add JWT config validation (optional)
- [ ] Add password config validation (optional)

## Phase 6: Testing

### Unit Tests
- [ ] PasswordService unit tests
- [ ] AuthService unit tests
- [ ] JWT Strategy unit tests
- [ ] Guards unit tests
- [ ] Decorators unit tests

### E2E Tests
- [ ] Registration flow E2E test
- [ ] Login flow E2E test
- [ ] Token refresh E2E test
- [ ] Logout E2E test
- [ ] Protected endpoints E2E tests
- [ ] Unauthorized access E2E tests

### Integration Tests
- [ ] Auth + Candidate integration
- [ ] Auth + Job integration
- [ ] Auth + JobApplication integration

## Phase 7: Documentation & Polish

### API Documentation
- [ ] Complete Swagger documentation
- [ ] Add example requests/responses
- [ ] Document error responses
- [ ] Add authentication examples

### Code Quality
- [ ] Run linter and fix issues
- [ ] Format code with Prettier
- [ ] Add JSDoc comments
- [ ] Review code for best practices

### Security Review
- [ ] Review password handling
- [ ] Review JWT implementation
- [ ] Review token storage
- [ ] Review error messages
- [ ] Security audit

## Phase 8: Future Enhancements (Optional)

### Email Verification
- [ ] Create email verification service
- [ ] Add verification token generation
- [ ] Add send verification email
- [ ] Add verify email endpoint

### OAuth Providers
- [ ] Create OAuth strategy interface
- [ ] Implement Google OAuth
- [ ] Implement GitHub OAuth
- [ ] Add provider linking

### Password Reset
- [ ] Create password reset service
- [ ] Add forgot password endpoint
- [ ] Add reset password endpoint
- [ ] Add email notifications

## Notes

- Mark items as complete when done
- Add notes for any deviations from plan
- Document any issues encountered
- Update this checklist as needed

