import { defineStore } from 'pinia'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
  role: string
  emailVerified?: boolean
  isActive?: boolean
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    fullName: (state) => {
      if (!state.user) return ''
      const parts = [state.user.firstName, state.user.lastName].filter(Boolean)
      return parts.length > 0 ? parts.join(' ') : state.user.email
    },
  },

  actions: {
    /**
     * Initialize auth state from storage
     */
    init() {
      if (process.client) {
        const storedAccessToken = localStorage.getItem('accessToken')
        const storedRefreshToken = localStorage.getItem('refreshToken')
        const storedUser = localStorage.getItem('user')

        if (storedAccessToken && storedRefreshToken && storedUser) {
          try {
            this.accessToken = storedAccessToken
            this.refreshToken = storedRefreshToken
            this.user = JSON.parse(storedUser) as User
          } catch (error) {
            console.error('Failed to parse stored user data:', error)
            this.clearAuth()
          }
        }
      }
    },

    /**
     * Login user and store tokens
     */
    async login(user: User, tokens: AuthTokens) {
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

    /**
     * Logout user and clear all auth data
     */
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

    /**
     * Update access token (after refresh)
     */
    updateAccessToken(accessToken: string) {
      this.accessToken = accessToken

      if (process.client) {
        localStorage.setItem('accessToken', accessToken)
      }
    },

    /**
     * Update tokens (after refresh)
     */
    updateTokens(tokens: AuthTokens) {
      this.accessToken = tokens.accessToken
      this.refreshToken = tokens.refreshToken

      if (process.client) {
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
      }
    },

    /**
     * Update user profile
     */
    updateUser(user: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...user }

        if (process.client) {
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      }
    },

    /**
     * Clear all auth data
     */
    clearAuth() {
      this.logout()
    },
  },
})

