/**
 * System Configuration Constants
 * Default options for system config dropdowns
 * These match the backend ENUMs
 */

export const TIME_FORMATS = ['24h', '12h'] as const

export const DATE_FORMATS = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD',
  'DD MMM YYYY',
  'MMM DD, YYYY',
  'DD/MM/YY',
  'MM/DD/YY',
  'YYYY/MM/DD',
] as const

export const THEMES = ['light', 'dark', 'auto'] as const

export const LANGUAGES = ['en', 'vi', 'es', 'fr', 'de', 'ja', 'ko', 'zh'] as const

/**
 * Common timezones (subset of IANA timezone identifiers)
 * Full list can be retrieved from backend API
 */
export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Ho_Chi_Minh',
  'Asia/Jakarta',
  'Asia/Manila',
  'Asia/Seoul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
] as const

