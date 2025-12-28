# Auth Module API Endpoints

## Overview

API endpoints for authentication module with email/password authentication.

## Public Endpoints (No Authentication Required)

### Register

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2025-12-28T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request` - Validation errors
- `409 Conflict` - Email already exists

---

### Login

**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid credentials

---

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request` - Invalid refresh token
- `401 Unauthorized` - Token expired or revoked

---

## Protected Endpoints (Authentication Required)

All protected endpoints require `Authorization: Bearer <accessToken>` header.

### Get Current User

**GET** `/auth/me`

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/avatar.jpg",
  "emailVerified": true,
  "isActive": true,
  "role": "user",
  "lastLoginAt": "2025-12-28T10:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-12-28T10:00:00Z"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired token

---

### Update Profile

**PATCH** `/auth/profile`

Update current user profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "updatedAt": "2025-12-28T11:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid or expired token

---

### Change Password

**PATCH** `/auth/change-password`

Change user password.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!",
  "confirmPassword": "NewSecurePassword456!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Errors:**
- `400 Bad Request` - Validation errors or passwords don't match
- `401 Unauthorized` - Invalid current password or expired token

---

### Logout

**POST** `/auth/logout`

Logout and revoke refresh token.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Errors:**
- `400 Bad Request` - Invalid refresh token
- `401 Unauthorized` - Invalid or expired token

---

## Updated Endpoints (With Auth Protection)

### Candidate Endpoints

**GET** `/candidates`
- **Before**: Public
- **After**: Requires authentication
- **Response**: Only returns candidates for current user

**POST** `/candidates`
- **Before**: Public
- **After**: Requires authentication
- **Auto-link**: Automatically links to current user

**GET** `/candidates/:id`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Only own candidate profile

**PATCH** `/candidates/:id`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Only own candidate profile

**DELETE** `/candidates/:id`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Only own candidate profile

---

### Job Endpoints

**GET** `/jobs`
- **Before**: Public
- **After**: Public (viewing allowed)
- **Note**: No change needed

**GET** `/jobs/:id`
- **Before**: Public
- **After**: Public (viewing allowed)
- **Note**: No change needed

**POST** `/jobs`
- **Before**: Public
- **After**: Requires authentication
- **Optional**: Track creator with `createdBy` field

**PATCH** `/jobs/:id`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Only job creator (if tracking enabled)

**DELETE** `/jobs/:id`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Only job creator (if tracking enabled)

---

### Job Application Endpoints

**POST** `/applications`
- **Before**: Public
- **After**: Requires authentication
- **Auto-link**: Automatically links to current user
- **Validation**: Prevents duplicate applications

**GET** `/applications`
- **Before**: Public
- **After**: Requires authentication
- **Filter**: Only returns applications for current user

**GET** `/applications/:id`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Own application or job owner

**GET** `/applications/job/:jobId`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Only job owner

**GET** `/applications/candidate/:candidateId`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Only own applications

**PATCH** `/applications/:id`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Only job owner

**DELETE** `/applications/:id`
- **Before**: Public
- **After**: Requires authentication
- **Access**: Own application or job owner

---

## Authentication Flow

### Registration Flow

```
1. Client → POST /auth/register
2. Server validates email/password
3. Server hashes password
4. Server creates user
5. Server generates JWT tokens
6. Server returns user + tokens
```

### Login Flow

```
1. Client → POST /auth/login
2. Server validates credentials
3. Server verifies password
4. Server generates JWT tokens
5. Server updates last_login_at
6. Server returns user + tokens
```

### Protected Request Flow

```
1. Client → GET /candidates (with Authorization header)
2. JWT Guard validates token
3. JWT Strategy extracts user
4. Request proceeds with user context
5. Controller uses @CurrentUser() decorator
6. Response returned
```

### Token Refresh Flow

```
1. Client → POST /auth/refresh (with refresh token)
2. Server validates refresh token
3. Server checks if token is revoked
4. Server generates new access token
5. Server optionally rotates refresh token
6. Server returns new tokens
```

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Validation Error Format

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## Rate Limiting

Auth endpoints should have rate limiting:
- Login: 5 attempts per 15 minutes
- Register: 3 attempts per hour
- Password reset: 3 attempts per hour

## Swagger Documentation

All endpoints are documented in Swagger UI:
- Access: http://localhost:3000/api
- Tag: `auth`
- Authentication: Click "Authorize" button and enter `Bearer <token>`

