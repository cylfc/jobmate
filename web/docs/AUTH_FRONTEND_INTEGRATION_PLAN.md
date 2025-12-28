# Auth Module Frontend Integration Plan

## 📋 Overview

Kế hoạch tích hợp backend Auth API vào frontend Nuxt 3 application. Frontend sẽ không gọi API trực tiếp mà thông qua các server API routes trong thư mục `server/`.

## 🏗️ Architecture

```
Frontend Components
    ↓
Composables (use-login.ts, use-register.ts, ...)
    ↓
Utils (auth-api.ts) - gọi server routes
    ↓
Server API Routes (server/api/auth/*.post.ts) - Nuxt server routes
    ↓
Backend API (NestJS) - http://localhost:3000/auth/*
```

## 📁 Current Structure

```
web/layers/auth/
├── components/
│   └── auth/
│       ├── login-form.vue
│       ├── register-form.vue
│       ├── forgot-password-form.vue
│       └── change-password-form.vue
├── composables/
│   └── auth/
│       ├── schemas.ts
│       ├── use-login.ts
│       ├── use-register.ts
│       ├── use-forgot-password.ts
│       └── use-change-password.ts
├── pages/
│   └── auth/
│       ├── login.vue
│       ├── register.vue
│       ├── forgot-password.vue
│       └── change-password.vue
├── server/
│   └── api/
│       └── auth/
│           ├── login.post.ts          ⚠️ Cần update
│           ├── register.post.ts       ⚠️ Cần update
│           ├── refresh.post.ts        ⚠️ Cần update
│           ├── logout.post.ts        ⚠️ Cần update
│           ├── change-password.post.ts ⚠️ Cần update
│           └── forgot-password.post.ts ⚠️ Cần update
└── utils/
    └── auth-api.ts                    ⚠️ Cần update
```

## 🎯 Implementation Plan

### Phase 1: Configuration & Setup

#### 1.1. Backend API Configuration
- [ ] Thêm `apiBaseUrl` vào `nuxt.config.ts` runtime config
- [ ] Tạo `.env.example` với `NUXT_API_BASE_URL=http://localhost:3000`
- [ ] Tạo utility function để get backend API URL

**Files to create/update:**
- `web/nuxt.config.ts` - Add runtime config
- `web/.env.example` - Add API base URL
- `web/layers/auth/utils/api-client.ts` - API client utility

#### 1.2. Type Definitions
- [ ] Update `AuthResponse` type để match với backend
- [ ] Tạo types cho backend request/response
- [ ] Tạo error types

**Files to create/update:**
- `web/layers/auth/types/auth.ts` - Auth types
- `web/layers/auth/utils/auth-api.ts` - Update types

### Phase 2: Server API Routes Implementation

#### 2.1. Login API Route
**File:** `web/layers/auth/server/api/auth/login.post.ts`

**Tasks:**
- [ ] Remove mock data
- [ ] Call backend API: `POST /auth/login`
- [ ] Handle errors properly
- [ ] Return formatted response

**Backend Endpoint:**
```
POST http://localhost:3000/auth/login
Body: { email: string, password: string }
Response: { user: User, accessToken: string, refreshToken: string }
```

#### 2.2. Register API Route
**File:** `web/layers/auth/server/api/auth/register.post.ts`

**Tasks:**
- [ ] Remove mock data
- [ ] Call backend API: `POST /auth/register`
- [ ] Handle validation errors
- [ ] Return formatted response

**Backend Endpoint:**
```
POST http://localhost:3000/auth/register
Body: { email: string, password: string, firstName?: string, lastName?: string }
Response: { user: User, accessToken: string, refreshToken: string }
```

#### 2.3. Refresh Token API Route
**File:** `web/layers/auth/server/api/auth/refresh.post.ts`

**Tasks:**
- [ ] Get refresh token from request (body hoặc cookie)
- [ ] Call backend API: `POST /auth/refresh`
- [ ] Handle token expiration
- [ ] Return new tokens

**Backend Endpoint:**
```
POST http://localhost:3000/auth/refresh
Body: { refreshToken: string }
Response: { accessToken: string, refreshToken: string }
```

#### 2.4. Logout API Route
**File:** `web/layers/auth/server/api/auth/logout.post.ts`

**Tasks:**
- [ ] Get refresh token from request
- [ ] Call backend API: `POST /auth/logout`
- [ ] Handle errors gracefully

**Backend Endpoint:**
```
POST http://localhost:3000/auth/logout
Body: { refreshToken: string }
Response: { message: string }
```

#### 2.5. Change Password API Route
**File:** `web/layers/auth/server/api/auth/change-password.post.ts`

**Tasks:**
- [ ] Get access token from headers
- [ ] Call backend API: `PATCH /auth/change-password`
- [ ] Handle authentication errors

**Backend Endpoint:**
```
PATCH http://localhost:3000/auth/change-password
Headers: { Authorization: Bearer <token> }
Body: { currentPassword: string, newPassword: string, confirmPassword: string }
Response: { message: string }
```

#### 2.6. Get Current User API Route (NEW)
**File:** `web/layers/auth/server/api/auth/me.get.ts` (cần tạo mới)

**Tasks:**
- [ ] Get access token from headers
- [ ] Call backend API: `GET /auth/me`
- [ ] Return user profile

**Backend Endpoint:**
```
GET http://localhost:3000/auth/me
Headers: { Authorization: Bearer <token> }
Response: User object
```

#### 2.7. Update Profile API Route (NEW)
**File:** `web/layers/auth/server/api/auth/profile.patch.ts` (cần tạo mới)

**Tasks:**
- [ ] Get access token from headers
- [ ] Call backend API: `PATCH /auth/profile`
- [ ] Handle validation errors

**Backend Endpoint:**
```
PATCH http://localhost:3000/auth/profile
Headers: { Authorization: Bearer <token> }
Body: { firstName?: string, lastName?: string, phone?: string, avatarUrl?: string }
Response: User object
```

### Phase 3: Auth State Management

#### 3.1. Auth Store (Pinia)
**File:** `web/layers/auth/stores/auth.ts` (cần tạo mới)

**Tasks:**
- [ ] Create Pinia store for auth state
- [ ] Store user info, accessToken, refreshToken
- [ ] Implement login, logout, refresh methods
- [ ] Persist to localStorage/cookie
- [ ] Auto-refresh token logic

**State:**
```typescript
{
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}
```

**Actions:**
- `login(user, tokens)`
- `logout()`
- `refreshToken()`
- `updateUser(user)`
- `clearAuth()`

#### 3.2. Token Management
- [ ] Store tokens securely (httpOnly cookies hoặc secure storage)
- [ ] Auto-refresh token before expiration
- [ ] Handle token refresh failures

### Phase 4: Update Utils & Composables

#### 4.1. Update Auth API Utils
**File:** `web/layers/auth/utils/auth-api.ts`

**Tasks:**
- [ ] Update `AuthResponse` interface
- [ ] Update all API calls to match backend response
- [ ] Add error handling
- [ ] Add `getProfile()` method
- [ ] Add `updateProfile()` method

#### 4.2. Update Composables
**Files:**
- `web/layers/auth/composables/auth/use-login.ts`
- `web/layers/auth/composables/auth/use-register.ts`
- `web/layers/auth/composables/auth/use-change-password.ts`

**Tasks:**
- [ ] Update to use auth store
- [ ] Store tokens after login/register
- [ ] Handle errors properly
- [ ] Update redirect logic

### Phase 5: Middleware & Guards

#### 5.1. Auth Middleware
**File:** `web/layers/auth/middleware/auth.ts` (cần tạo mới)

**Tasks:**
- [ ] Check authentication status
- [ ] Redirect to login if not authenticated
- [ ] Handle public routes
- [ ] Refresh token if needed

#### 5.2. Route Protection
- [ ] Add middleware to protected routes
- [ ] Update navigation guards
- [ ] Handle 401 errors globally

### Phase 6: Error Handling

#### 6.1. Global Error Handler
- [ ] Handle 401 Unauthorized (auto logout)
- [ ] Handle 403 Forbidden
- [ ] Handle network errors
- [ ] Show user-friendly error messages

#### 6.2. API Error Types
- [ ] Create error type definitions
- [ ] Map backend errors to frontend messages
- [ ] Handle validation errors

### Phase 7: Testing & Validation

#### 7.1. Integration Testing
- [ ] Test login flow
- [ ] Test register flow
- [ ] Test token refresh
- [ ] Test logout
- [ ] Test protected routes
- [ ] Test error scenarios

#### 7.2. Edge Cases
- [ ] Token expiration handling
- [ ] Network failures
- [ ] Invalid credentials
- [ ] Duplicate registration
- [ ] Password validation errors

## 📝 Detailed Implementation

### 1. Configuration Setup

#### nuxt.config.ts
```typescript
runtimeConfig: {
  // Server-only
  apiBaseUrl: process.env.NUXT_API_BASE_URL || 'http://localhost:3000',
  
  // Public (exposed to client)
  public: {
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  }
}
```

#### .env.example
```env
NUXT_API_BASE_URL=http://localhost:3000
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 2. API Client Utility

#### utils/api-client.ts
```typescript
export const useApiClient = () => {
  const config = useRuntimeConfig()
  const baseURL = config.apiBaseUrl || 'http://localhost:3000'
  
  const request = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw createError({
        statusCode: response.status,
        message: error.message || 'Request failed',
        data: error,
      })
    }
    
    return response.json()
  }
  
  return { request }
}
```

### 3. Server API Route Example

#### server/api/auth/login.post.ts
```typescript
import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = loginSchema.parse(body)
    
    const apiClient = useApiClient()
    const response = await apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(validated),
    })
    
    // Transform backend response to frontend format
    return {
      user: response.user,
      token: response.accessToken,
      refreshToken: response.refreshToken,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input',
        data: error.errors,
      })
    }
    
    // Handle backend errors
    if (error.statusCode === 401) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }
    
    throw createError({
      statusCode: 500,
      message: 'Login failed',
    })
  }
})
```

### 4. Auth Store

#### stores/auth.ts
```typescript
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
  },
  
  actions: {
    async login(user: User, tokens: { accessToken: string, refreshToken: string }) {
      this.user = user
      this.accessToken = tokens.accessToken
      this.refreshToken = tokens.refreshToken
      
      // Persist to storage
      if (process.client) {
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
      }
    },
    
    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      
      if (process.client) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    },
    
    // ... other actions
  },
})
```

## 🔄 Backend API Mapping

| Frontend Route | Backend Endpoint | Method | Auth Required |
|---------------|------------------|--------|---------------|
| `/api/auth/login` | `/auth/login` | POST | No |
| `/api/auth/register` | `/auth/register` | POST | No |
| `/api/auth/refresh` | `/auth/refresh` | POST | No |
| `/api/auth/logout` | `/auth/logout` | POST | Yes |
| `/api/auth/me` | `/auth/me` | GET | Yes |
| `/api/auth/profile` | `/auth/profile` | PATCH | Yes |
| `/api/auth/change-password` | `/auth/change-password` | PATCH | Yes |

## 📋 Checklist

### Configuration
- [ ] Add API base URL to nuxt.config.ts
- [ ] Create .env.example
- [ ] Create API client utility

### Server Routes
- [ ] Update login.post.ts
- [ ] Update register.post.ts
- [ ] Update refresh.post.ts
- [ ] Update logout.post.ts
- [ ] Update change-password.post.ts
- [ ] Create me.get.ts
- [ ] Create profile.patch.ts

### State Management
- [ ] Create auth store
- [ ] Implement token persistence
- [ ] Implement auto-refresh logic

### Utils & Composables
- [ ] Update auth-api.ts
- [ ] Update use-login.ts
- [ ] Update use-register.ts
- [ ] Update use-change-password.ts

### Middleware
- [ ] Create auth middleware
- [ ] Add route protection

### Testing
- [ ] Test all auth flows
- [ ] Test error handling
- [ ] Test token refresh

## 🚀 Next Steps

1. **Start with Configuration** - Setup API base URL and client utility
2. **Implement Server Routes** - Update all server API routes to call backend
3. **Create Auth Store** - Implement state management
4. **Update Composables** - Connect everything together
5. **Add Middleware** - Protect routes
6. **Test Everything** - Ensure all flows work

## 📚 References

- Backend API Documentation: `backend/docs/AUTH_API_ENDPOINTS.md`
- Backend Implementation: `backend/src/auth/`
- Nuxt Server Routes: https://nuxt.com/docs/guide/directory-structure/server

