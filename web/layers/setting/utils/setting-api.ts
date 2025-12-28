/**
 * Setting API Utilities
 * API utility functions for setting-related operations
 * Stateless functions - no reactive state
 */
import type { UserProfile, SecuritySettings, NotificationSettings, SystemConfig } from '@setting/types/setting'

export const useSettingApi = () => {
  const { $api } = useNuxtApp()

  /**
   * Get user profile
   * Uses auth API endpoint
   */
  const getProfile = async (): Promise<UserProfile> => {
    try {
      const response = await $api<{ user: {
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
      } }>('/api/auth/me', {
        method: 'GET',
      })
      
      // Transform auth user to UserProfile
      return {
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        email: response.user.email,
        phone: response.user.phone,
        bio: '', // Bio is not in auth API, can be added later
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  /**
   * Update user profile
   * Uses auth API endpoint
   */
  const updateProfile = async (profile: UserProfile): Promise<UserProfile> => {
    try {
      const response = await $api<{ user: {
        id: string
        email: string
        firstName?: string
        lastName?: string
        phone?: string
        avatarUrl?: string
        role: string
        emailVerified?: boolean
        isActive?: boolean
        updatedAt?: string
      } }>('/api/auth/profile', {
        method: 'PATCH',
        body: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          // Note: bio and email are not updatable via auth API
          // Email changes might require separate endpoint
        },
      })
      
      // Transform auth user to UserProfile
      return {
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        email: response.user.email,
        phone: response.user.phone,
        bio: profile.bio, // Keep existing bio as it's not in response
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  /**
   * Get security settings
   */
  const getSecuritySettings = async (): Promise<SecuritySettings> => {
    try {
      const response = await $api<{ settings: SecuritySettings }>('/api/settings/security', {
        method: 'GET',
      })
      return response.settings
    } catch (error) {
      console.error('Error fetching security settings:', error)
      throw error
    }
  }

  /**
   * Update security settings
   */
  const updateSecuritySettings = async (settings: SecuritySettings): Promise<SecuritySettings> => {
    try {
      const response = await $api<{ settings: SecuritySettings }>('/api/settings/security', {
        method: 'PUT',
        body: settings,
      })
      return response.settings
    } catch (error) {
      console.error('Error updating security settings:', error)
      throw error
    }
  }

  /**
   * Get notification settings
   */
  const getNotificationSettings = async (): Promise<NotificationSettings> => {
    try {
      const response = await $api<{ settings: NotificationSettings }>('/api/settings/notification', {
        method: 'GET',
      })
      return response.settings
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      throw error
    }
  }

  /**
   * Update notification settings
   */
  const updateNotificationSettings = async (settings: NotificationSettings): Promise<NotificationSettings> => {
    try {
      const response = await $api<{ settings: NotificationSettings }>('/api/settings/notification', {
        method: 'PUT',
        body: settings,
      })
      return response.settings
    } catch (error) {
      console.error('Error updating notification settings:', error)
      throw error
    }
  }

  /**
   * Get system config
   */
  const getSystemConfig = async (): Promise<SystemConfig> => {
    try {
      const response = await $api<{ config: SystemConfig }>('/api/settings/system', {
        method: 'GET',
      })
      return response.config
    } catch (error) {
      console.error('Error fetching system config:', error)
      throw error
    }
  }

  /**
   * Update system config
   */
  const updateSystemConfig = async (config: SystemConfig): Promise<SystemConfig> => {
    try {
      const response = await $api<{ config: SystemConfig }>('/api/settings/system', {
        method: 'PUT',
        body: config,
      })
      return response.config
    } catch (error) {
      console.error('Error updating system config:', error)
      throw error
    }
  }

  return {
    getProfile,
    updateProfile,
    getSecuritySettings,
    updateSecuritySettings,
    getNotificationSettings,
    updateNotificationSettings,
    getSystemConfig,
    updateSystemConfig,
  }
}

