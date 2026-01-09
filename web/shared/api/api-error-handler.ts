/**
 * API Error Handler
 * Centralized error handling for API requests
 */

import type { ApiResponse } from '../../types/api-response'

export interface ApiError {
  statusCode: number
  message: string
  data?: unknown
  code?: string
}

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  
  // HTTP errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Extract error code from HTTP status
 */
export function getErrorCode(status: number): ErrorCode {
  if (status >= 400 && status < 500) {
    switch (status) {
      case 400:
        return ErrorCode.BAD_REQUEST
      case 401:
        return ErrorCode.UNAUTHORIZED
      case 403:
        return ErrorCode.FORBIDDEN
      case 404:
        return ErrorCode.NOT_FOUND
      case 422:
        return ErrorCode.VALIDATION_ERROR
      default:
        return ErrorCode.BAD_REQUEST
    }
  }
  
  if (status >= 500) {
    return ErrorCode.SERVER_ERROR
  }
  
  return ErrorCode.UNKNOWN_ERROR
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  
  const message = error.message.toLowerCase()
  return (
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('timeout')
  )
}

/**
 * Handle API error and transform to standardized format
 */
export function handleApiError(
  error: unknown,
  url?: string,
  baseURL?: string
): ApiError {
  // Re-throw if it's already a Nuxt error with statusCode
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const nuxtError = error as { statusCode: number; message: string; data?: unknown }
    return {
      statusCode: nuxtError.statusCode,
      message: nuxtError.message || 'Request failed',
      data: nuxtError.data,
      code: getErrorCode(nuxtError.statusCode),
    }
  }

  // Handle network errors
  if (isNetworkError(error)) {
    const errorMessage = error instanceof Error ? error.message : 'Network error'
    return {
      statusCode: 500,
      message: baseURL && url
        ? `Failed to connect to backend API at ${baseURL}${url}. Please ensure the backend server is running. Original error: ${errorMessage}`
        : `Network error: ${errorMessage}`,
      code: ErrorCode.NETWORK_ERROR,
      data: {
        url,
        baseURL,
        originalError: errorMessage,
      },
    }
  }

  // Handle unknown errors
  return {
    statusCode: 500,
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    code: ErrorCode.UNKNOWN_ERROR,
    data: error,
  }
}

/**
 * Parse error from API response
 */
export function parseApiError(
  response: Response,
  responseData: unknown
): ApiError {
  const isNewFormat = responseData && 
                      typeof responseData === 'object' && 
                      'data' in responseData && 
                      'status' in responseData

  if (isNewFormat) {
    const apiResponse = responseData as ApiResponse<null>
    const errorMeta = apiResponse.meta as { error?: { message?: string; code?: string } } | undefined
    const errorMessage = errorMeta?.error?.message || response.statusText || 'Request failed'
    const statusCode = apiResponse.status || response.status
    
    return {
      statusCode,
      message: errorMessage,
      code: errorMeta?.error?.code || getErrorCode(statusCode),
      data: responseData,
    }
  }

  // Fallback for old format
  const errorData = responseData as { message?: string }
  return {
    statusCode: response.status,
    message: errorData?.message || response.statusText || 'Request failed',
    code: getErrorCode(response.status),
    data: responseData,
  }
}
