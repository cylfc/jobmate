/**
 * Logger Utility
 * Centralized logging for the application
 * Replaces console.log/error/warn with structured logging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
  context?: string
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: unknown, context?: string): void {
    if (!this.isDevelopment) return
    
    this.log(LogLevel.DEBUG, message, data, context)
  }

  /**
   * Log info message
   */
  info(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.INFO, message, data, context)
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.WARN, message, data, context)
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    const errorObj = error instanceof Error ? error : undefined
    const errorData = error && !(error instanceof Error) ? error : undefined
    
    this.log(LogLevel.ERROR, message, errorData, context, errorObj)
    
    // In production, send to error tracking service
    if (this.isProduction && errorObj) {
      this.sendToErrorTracking(errorObj, message, context)
    }
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: unknown,
    context?: string,
    error?: Error
  ): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    // Format log message
    const prefix = context ? `[${context}]` : ''
    const logMessage = `${prefix} ${message}`

    // Output to console based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data || '')
        break
      case LogLevel.INFO:
        console.info(logMessage, data || '')
        break
      case LogLevel.WARN:
        console.warn(logMessage, data || '')
        break
      case LogLevel.ERROR:
        console.error(logMessage, error || data || '')
        if (error?.stack) {
          console.error('Stack:', error.stack)
        }
        break
    }

    // In development, also log structured entry
    if (this.isDevelopment) {
      // Could send to logging service here
      // this.sendToLoggingService(entry)
    }
  }

  /**
   * Send error to error tracking service (Sentry, LogRocket, etc.)
   */
  private sendToErrorTracking(error: Error, message: string, context?: string): void {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { tags: { context } })
    
    // For now, just log (will be implemented when service is configured)
    if (this.isDevelopment) {
      console.warn('[Error Tracking] Would send to error tracking service:', {
        error: error.message,
        message,
        context,
      })
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const logDebug = (message: string, data?: unknown, context?: string) => 
  logger.debug(message, data, context)

export const logInfo = (message: string, data?: unknown, context?: string) => 
  logger.info(message, data, context)

export const logWarn = (message: string, data?: unknown, context?: string) => 
  logger.warn(message, data, context)

export const logError = (message: string, error?: Error | unknown, context?: string) => 
  logger.error(message, error, context)
