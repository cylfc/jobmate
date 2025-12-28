# Auth Module Database Schema

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                         USER                             │
├─────────────────────────────────────────────────────────┤
│ PK  id                    UUID                          │
│     email                 VARCHAR(255) UNIQUE           │
│     password_hash         VARCHAR(255)                  │
│     first_name            VARCHAR(100)                   │
│     last_name             VARCHAR(100)                  │
│     phone                 VARCHAR(20)                   │
│     avatar_url            VARCHAR(500)                   │
│     email_verified        BOOLEAN                       │
│     email_verified_at     TIMESTAMP                     │
│     is_active             BOOLEAN                       │
│     last_login_at         TIMESTAMP                     │
│     role                  VARCHAR(50)                   │
│     created_at            TIMESTAMP                     │
│     updated_at            TIMESTAMP                     │
│                                                         │
│ INDEX: email, role                                      │
└─────────────────────────────────────────────────────────┘
                            │
                            │ 1
                            │
                            │
                            │ N
┌─────────────────────────────────────────────────────────┐
│                    AUTH_PROVIDER                         │
├─────────────────────────────────────────────────────────┤
│ PK  id                    UUID                          │
│ FK  user_id               UUID → user.id                │
│     provider              VARCHAR(50)                   │
│     provider_user_id      VARCHAR(255)                  │
│     access_token          TEXT                          │
│     refresh_token         TEXT                          │
│     expires_at            TIMESTAMP                     │
│     created_at            TIMESTAMP                     │
│     updated_at            TIMESTAMP                     │
│                                                         │
│ UNIQUE: (user_id, provider)                            │
│ INDEX: user_id, provider                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    REFRESH_TOKEN                          │
├─────────────────────────────────────────────────────────┤
│ PK  id                    UUID                          │
│ FK  user_id               UUID → user.id                │
│     token                 VARCHAR(500) UNIQUE           │
│     expires_at            TIMESTAMP                     │
│     is_revoked            BOOLEAN                       │
│     revoked_at            TIMESTAMP                     │
│     created_at            TIMESTAMP                     │
│                                                         │
│ INDEX: user_id, token, expires_at                      │
└─────────────────────────────────────────────────────────┘
```

## Table Details

### user

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email address (login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(100) | NULL | First name |
| last_name | VARCHAR(100) | NULL | Last name |
| phone | VARCHAR(20) | NULL | Phone number |
| avatar_url | VARCHAR(500) | NULL | Avatar image URL |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| email_verified_at | TIMESTAMP | NULL | Email verification timestamp |
| is_active | BOOLEAN | DEFAULT true | Account active status |
| last_login_at | TIMESTAMP | NULL | Last login timestamp |
| role | VARCHAR(50) | DEFAULT 'user' | User role (user, admin, recruiter) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_user_email` on `email` (UNIQUE)
- `idx_user_role` on `role`

**Enums:**
- `role`: 'user', 'admin', 'recruiter'

### auth_provider

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | NOT NULL, FK → user.id | Reference to user |
| provider | VARCHAR(50) | NOT NULL | Provider name (email, google, github) |
| provider_user_id | VARCHAR(255) | NULL | External provider user ID |
| access_token | TEXT | NULL | OAuth access token |
| refresh_token | TEXT | NULL | OAuth refresh token |
| expires_at | TIMESTAMP | NULL | Token expiration |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Update timestamp |

**Constraints:**
- UNIQUE constraint on `(user_id, provider)` - One provider per user
- FOREIGN KEY on `user_id` → `user.id` ON DELETE CASCADE

**Indexes:**
- `idx_auth_provider_user_id` on `user_id`
- `idx_auth_provider_provider` on `provider`

**Provider Values:**
- `email` - Email/password authentication
- `google` - Google OAuth
- `github` - GitHub OAuth
- `facebook` - Facebook OAuth (future)
- `linkedin` - LinkedIn OAuth (future)

### refresh_token

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | NOT NULL, FK → user.id | Reference to user |
| token | VARCHAR(500) | NOT NULL, UNIQUE | Refresh token string |
| expires_at | TIMESTAMP | NOT NULL | Token expiration |
| is_revoked | BOOLEAN | DEFAULT false | Revocation status |
| revoked_at | TIMESTAMP | NULL | Revocation timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Constraints:**
- FOREIGN KEY on `user_id` → `user.id` ON DELETE CASCADE
- UNIQUE constraint on `token`

**Indexes:**
- `idx_refresh_token_user_id` on `user_id`
- `idx_refresh_token_token` on `token` (UNIQUE)
- `idx_refresh_token_expires_at` on `expires_at`

## Relationships

1. **User → AuthProvider**: One-to-Many
   - One user can have multiple auth providers
   - Cascade delete: When user is deleted, all providers are deleted

2. **User → RefreshToken**: One-to-Many
   - One user can have multiple refresh tokens (multi-device support)
   - Cascade delete: When user is deleted, all tokens are deleted

3. **User → Candidate** (Optional Integration)
   - One user can have one candidate profile
   - Link via `userId` field in Candidate entity

## Migration SQL

```sql
-- Create User table
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

-- Create Auth Provider table
CREATE TABLE auth_provider (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_auth_provider_user_id ON auth_provider(user_id);
CREATE INDEX idx_auth_provider_provider ON auth_provider(provider);

-- Create Refresh Token table
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

-- Optional: Add userId to Candidate table
ALTER TABLE candidate ADD COLUMN user_id UUID REFERENCES "user"(id) ON DELETE SET NULL;
CREATE INDEX idx_candidate_user_id ON candidate(user_id);
```

## Sample Data

### User

```typescript
{
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "john.doe@example.com",
  password_hash: "$2b$10$...", // bcrypt hash
  first_name: "John",
  last_name: "Doe",
  phone: "+1234567890",
  avatar_url: "https://example.com/avatar.jpg",
  email_verified: true,
  email_verified_at: "2025-01-01T00:00:00Z",
  is_active: true,
  last_login_at: "2025-12-28T10:00:00Z",
  role: "user",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-12-28T10:00:00Z"
}
```

### Auth Provider

```typescript
{
  id: "123e4567-e89b-12d3-a456-426614174001",
  user_id: "123e4567-e89b-12d3-a456-426614174000",
  provider: "email",
  provider_user_id: null,
  access_token: null,
  refresh_token: null,
  expires_at: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z"
}
```

### Refresh Token

```typescript
{
  id: "123e4567-e89b-12d3-a456-426614174002",
  user_id: "123e4567-e89b-12d3-a456-426614174000",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expires_at: "2026-01-04T00:00:00Z",
  is_revoked: false,
  revoked_at: null,
  created_at: "2025-12-28T00:00:00Z"
}
```

