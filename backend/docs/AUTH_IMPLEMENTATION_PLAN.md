# Auth Module Implementation Plan

## Overview

Implementation plan for authentication module with email/password authentication, designed to be extensible for OAuth providers (Google, GitHub, etc.) in the future.

## Database Design

### User Entity

```sql
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(role);
```

### Auth Provider Entity (for future OAuth)

```sql
CREATE TABLE auth_provider (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'email', 'google', 'github', etc.
  provider_user_id VARCHAR(255), -- External provider user ID
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_auth_provider_user_id ON auth_provider(user_id);
CREATE INDEX idx_auth_provider_provider ON auth_provider(provider);
```

### Refresh Token Entity

```sql
CREATE TABLE refresh_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_token_user_id ON refresh_token(user_id);
CREATE INDEX idx_refresh_token_token ON refresh_token(token);
CREATE INDEX idx_refresh_token_expires_at ON refresh_token(expires_at);
```

## Architecture

### Module Structure

```
src/
├── auth/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── auth-provider.entity.ts
│   │   └── refresh-token.entity.ts
│   ├── models/
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   ├── change-password.dto.ts
│   │   │   └── update-profile.dto.ts
│   │   └── types/
│   │       ├── auth-response.type.ts
│   │       └── jwt-payload.type.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── password.service.ts
│   ├── controllers/
│   │   └── auth.controller.ts
│   └── auth.module.ts
│
├── core/
│   ├── guards/
│   │   └── jwt-auth.guard.ts (global)
│   └── core.module.ts
```

## Technology Stack

### Dependencies

```json
{
  "dependencies": {
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0"
  },
  "devDependencies": {
    "@types/passport-jwt": "^4.0.0",
    "@types/bcrypt": "^5.0.2"
  }
}
```

## Implementation Phases

### Phase 1: Core Authentication (Email/Password)

#### 1.1 User Entity
- Create User entity with email, password_hash, profile fields
- Add indexes for email and role
- Add relationships to Candidate (optional)

#### 1.2 Password Service
- Hash passwords using bcrypt
- Verify passwords
- Password strength validation

#### 1.3 Auth Service
- `register()` - Create new user with hashed password
- `login()` - Validate credentials and return JWT tokens
- `validateUser()` - Validate user for JWT strategy
- `refreshToken()` - Generate new access token from refresh token
- `logout()` - Revoke refresh token

#### 1.4 JWT Strategy
- Extract JWT from Authorization header
- Validate token and return user payload
- Handle token expiration

#### 1.5 Auth Controller
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (revoke refresh token)
- `GET /auth/me` - Get current user profile
- `PATCH /auth/profile` - Update user profile
- `PATCH /auth/change-password` - Change password

### Phase 2: Guards & Decorators

#### 2.1 JWT Auth Guard
- Global guard for all routes (except public)
- Validate JWT token
- Attach user to request

#### 2.2 Public Decorator
- Mark routes as public (skip authentication)
- Use on login, register endpoints

#### 2.3 Current User Decorator
- Extract current user from request
- Type-safe user access in controllers

#### 2.4 Roles Guard (Optional)
- Role-based access control
- Admin, User, Recruiter roles

### Phase 3: Integration with Existing Modules

#### 3.1 Protect Candidate Module
- Add `@UseGuards(JwtAuthGuard)` to CandidateController
- Link Candidate to User (add userId field)
- Filter candidates by current user

#### 3.2 Protect Job Module
- Add authentication to JobController
- Optional: Add createdBy field to Job entity
- Filter jobs by creator (if needed)

#### 3.3 Protect JobApplication Module
- Ensure only authenticated users can apply
- Link applications to authenticated user
- Prevent duplicate applications

### Phase 4: Refresh Token Implementation

#### 4.1 Refresh Token Entity
- Store refresh tokens in database
- Track expiration and revocation
- One token per user (or multiple for multi-device)

#### 4.2 Refresh Token Service
- Generate refresh tokens
- Validate and rotate tokens
- Revoke tokens on logout

### Phase 5: Email Verification (Future)

#### 5.1 Email Verification
- Send verification email on registration
- Verify email endpoint
- Mark email as verified

### Phase 6: OAuth Providers (Future Extension)

#### 6.1 Auth Provider Entity
- Store OAuth provider information
- Link multiple providers to one user
- Store access/refresh tokens

#### 6.2 OAuth Strategy Pattern
- Google OAuth strategy
- GitHub OAuth strategy
- Extensible for other providers

## API Endpoints

### Public Endpoints

```
POST /auth/register
POST /auth/login
POST /auth/refresh
```

### Protected Endpoints

```
POST /auth/logout
GET  /auth/me
PATCH /auth/profile
PATCH /auth/change-password
```

### Updated Endpoints (with Auth)

```
GET    /candidates        - Requires auth
POST   /candidates        - Requires auth
GET    /candidates/:id    - Requires auth
PATCH  /candidates/:id    - Requires auth (own profile only)
DELETE /candidates/:id    - Requires auth (own profile only)

GET    /jobs              - Public (can view)
POST   /jobs              - Requires auth
GET    /jobs/:id          - Public
PATCH  /jobs/:id          - Requires auth
DELETE /jobs/:id          - Requires auth

POST   /applications      - Requires auth
GET    /applications      - Requires auth (own applications)
GET    /applications/:id  - Requires auth (own or job owner)
PATCH  /applications/:id  - Requires auth (job owner only)
```

## Security Considerations

### Password Security
- Use bcrypt with salt rounds (10-12)
- Never store plain text passwords
- Enforce password strength requirements
- Rate limiting on login attempts

### JWT Security
- Use strong JWT secret (from env)
- Set appropriate expiration times
- Use refresh tokens for long-lived sessions
- Validate token expiration

### API Security
- HTTPS in production
- Rate limiting on auth endpoints
- CORS configuration
- Input validation on all DTOs

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Password
BCRYPT_ROUNDS=10

# Email (for future email verification)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

## Migration Strategy

1. Create User entity migration
2. Create AuthProvider entity migration (for future)
3. Create RefreshToken entity migration
4. Add userId to Candidate entity (optional)
5. Add createdBy to Job entity (optional)

## Testing Strategy

### Unit Tests
- Password hashing/verification
- JWT token generation/validation
- Auth service methods
- Guards and decorators

### E2E Tests
- Registration flow
- Login flow
- Token refresh flow
- Protected endpoints access
- Unauthorized access attempts

## Future Enhancements

1. **OAuth Providers**
   - Google OAuth
   - GitHub OAuth
   - Facebook OAuth
   - LinkedIn OAuth

2. **Two-Factor Authentication (2FA)**
   - TOTP support
   - SMS verification
   - Email verification codes

3. **Password Reset**
   - Forgot password flow
   - Reset password with token
   - Email notifications

4. **Account Management**
   - Email change
   - Account deletion
   - Account suspension

5. **Session Management**
   - Multiple device sessions
   - Session revocation
   - Active sessions list

## Integration with Existing Modules

### Candidate Module
- Link Candidate to User
- Auto-create Candidate on user registration (optional)
- Filter candidates by user

### Job Module
- Track job creator (optional)
- Filter jobs by creator
- Job ownership validation

### JobApplication Module
- Require authentication for applications
- Link applications to authenticated user
- Prevent duplicate applications per user

## Best Practices

1. **Password Handling**
   - Never log passwords
   - Hash before storing
   - Use strong hashing algorithm (bcrypt)

2. **Token Management**
   - Short-lived access tokens (15min)
   - Long-lived refresh tokens (7 days)
   - Store refresh tokens securely

3. **Error Messages**
   - Generic error messages for security
   - Don't reveal if email exists
   - Rate limit error responses

4. **User Experience**
   - Clear error messages
   - Helpful validation messages
   - Secure but user-friendly

## References

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [NestJS JWT](https://docs.nestjs.com/security/authentication#jwt-functionality)
- [Passport.js](http://www.passportjs.org/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

