/**
 * Setting Types
 * TypeScript interfaces for setting layer
 */

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
}

export interface SecuritySettings {
  twoFactorEnabled?: boolean
  sessionTimeout?: number
  loginNotifications?: boolean
}

export interface NotificationSettings {
  emailJobMatches: boolean
  emailNewCandidates: boolean
  emailWeeklyDigest: boolean
  pushJobMatches: boolean
  pushNewCandidates: boolean
  pushMessages: boolean
  inAppJobMatches: boolean
  inAppNewCandidates: boolean
  inAppMessages: boolean
}

export interface SystemConfig {
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  language?: string
  theme?: 'light' | 'dark' | 'auto'
}

