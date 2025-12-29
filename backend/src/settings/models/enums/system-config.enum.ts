/**
 * System Configuration Enums
 * Defines allowed values for system settings
 */

/**
 * Time Format Enum
 */
export enum TimeFormat {
  HOUR_12 = '12h',
  HOUR_24 = '24h',
}

/**
 * Date Format Enum
 * Common date format patterns
 */
export enum DateFormat {
  DD_MM_YYYY = 'DD/MM/YYYY',
  MM_DD_YYYY = 'MM/DD/YYYY',
  YYYY_MM_DD = 'YYYY-MM-DD',
  DD_MMM_YYYY = 'DD MMM YYYY',
  MMM_DD_YYYY = 'MMM DD, YYYY',
  DD_MM_YY = 'DD/MM/YY',
  MM_DD_YY = 'MM/DD/YY',
  YYYY_MM_DD_DASH = 'YYYY/MM/DD',
}

/**
 * Theme Enum
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

/**
 * Language Enum
 * ISO 639-1 language codes
 */
export enum Language {
  EN = 'en',
  VI = 'vi',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  JA = 'ja',
  KO = 'ko',
  ZH = 'zh',
}

