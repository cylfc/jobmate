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

/**
 * System Configuration Types
 * Match backend ENUMs
 */
export type TimeFormat = '12h' | '24h'

export type DateFormat = 
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY-MM-DD'
  | 'DD MMM YYYY'
  | 'MMM DD, YYYY'
  | 'DD/MM/YY'
  | 'MM/DD/YY'
  | 'YYYY/MM/DD'

export type Theme = 'light' | 'dark' | 'auto'

export type Language = 'en' | 'vi' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh'

export interface SystemConfig {
  timezone: string
  dateFormat: DateFormat
  timeFormat: TimeFormat
  language?: Language
  theme?: Theme
}

export interface SystemConfigOptions {
  timezones: string[]
  dateFormats: DateFormat[]
  timeFormats: TimeFormat[]
  themes: Theme[]
  languages: Language[]
}

