/**
 * Auth API Utilities
 * API utility functions for authentication-related operations
 * Stateless functions - no reactive state
 */
import type { LoginInput, RegisterInput, ForgotPasswordInput, ChangePasswordInput } from '@auth/composables/auth/schemas'

export interface AuthResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  token: string
  refreshToken?: string
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
  const changePassword = async (input: Omit<ChangePasswordInput, 'confirmPassword'>): Promise<void> => {
    try {
      await $fetch('/api/auth/change-password', {
        method: 'POST',
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
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
  const logout = async (): Promise<void> => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  /**
   * Refresh access token
   */
  const refreshToken = async (): Promise<AuthResponse> => {
    try {
      const response = await $fetch<AuthResponse>('/api/auth/refresh', {
        method: 'POST',
      })
      return response
    } catch (error) {
      console.error('Error refreshing token:', error)
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
  }
}

