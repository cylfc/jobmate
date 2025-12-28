/**
 * Auth API Utilities
 * API utility functions for authentication-related operations
 * Stateless functions - no reactive state
 */
import type { LoginInput, RegisterInput, ForgotPasswordInput, ChangePasswordInput } from '@auth/composables/auth/schemas'
import type { User } from '@auth/stores/auth'

export interface AuthResponse {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: string
  }
  token: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

export interface UserProfileResponse {
  user: User
}

export const useAuthApi = () => {
  /**
   * Login user
   */
  const login = async (input: LoginInput): Promise<AuthResponse> => {
    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  }

  /**
   * Register new user
   */
  const register = async (input: Omit<RegisterInput, 'confirmPassword'>): Promise<AuthResponse> => {
    try {
      const response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: input.password,
        },
      })
      return response
    } catch (error) {
      console.error('Error registering:', error)
      throw error
    }
  }

  /**
   * Request password reset
   */
  const forgotPassword = async (input: ForgotPasswordInput): Promise<void> => {
    try {
      await $fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: input,
      })
    } catch (error) {
      console.error('Error requesting password reset:', error)
      throw error
    }
  }

  /**
   * Change password
   */
  const changePassword = async (input: ChangePasswordInput): Promise<void> => {
    try {
      await $fetch('/api/auth/change-password', {
        method: 'POST',
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
          confirmPassword: input.confirmPassword,
        },
      })
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }

  /**
   * Logout user
   */
  const logout = async (refreshToken: string, accessToken?: string): Promise<void> => {
    try {
      const headers: Record<string, string> = {}
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      await $fetch('/api/auth/logout', {
        method: 'POST',
        headers,
        body: { refreshToken },
      })
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  /**
   * Refresh access token
   */
  const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      const response = await $fetch<RefreshTokenResponse>('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      })
      return response
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  }

  /**
   * Get current user profile
   */
  const getProfile = async (): Promise<UserProfileResponse> => {
    try {
      const response = await $fetch<UserProfileResponse>('/api/auth/me', {
        method: 'GET',
      })
      return response
    } catch (error) {
      console.error('Error getting profile:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (profile: {
    firstName?: string
    lastName?: string
    phone?: string
    avatarUrl?: string
  }): Promise<UserProfileResponse> => {
    try {
      const response = await $fetch<UserProfileResponse>('/api/auth/profile', {
        method: 'PATCH',
        body: profile,
      })
      return response
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return {
    login,
    register,
    forgotPassword,
    changePassword,
    logout,
    refreshToken,
    getProfile,
    updateProfile,
  }
}

