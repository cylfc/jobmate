/**
 * API Client Utility
 * Centralized utility for making requests to backend API
 * Used in server API routes only
 * Backend returns format: { data, meta, status }
 */

import type { ApiResponse } from '../../types/api-response'
import { handleApiError, parseApiError, type ApiError } from './api-error-handler'

export interface ApiClientOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
}

export interface ApiClientConfig {
  baseURL: string
  options?: ApiClientOptions
}

/**
 * Create API client instance
 */
export const useApiClient = (config?: Partial<ApiClientConfig>) => {
  const runtimeConfig = useRuntimeConfig()
  const baseURL = config?.baseURL || runtimeConfig.apiBaseUrl || 'http://localhost:3000'
  const options: ApiClientOptions = {
    timeout: 30000, // 30 seconds
    retries: 0,
    retryDelay: 1000,
    ...config?.options,
  }

  /**
   * Make a request to backend API
   * Returns full ApiResponse format: { data, meta, status }
   */
  const request = async <T = unknown>(
    endpoint: string,
    requestOptions: RequestInit = {},
  ): Promise<ApiResponse<T>> => {
    const url = `${baseURL}${endpoint}`

    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), options.timeout)

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(requestOptions.headers as Record<string, string>),
        },
      })

      clearTimeout(timeoutId)

      const responseData = await response.json().catch(() => ({}))

      // Check if response follows new format { data, meta, status }
      const isNewFormat = responseData && 
                          typeof responseData === 'object' && 
                          'data' in responseData && 
                          'status' in responseData

      if (!response.ok) {
        const apiError = parseApiError(response, responseData)
        throw createError({
          statusCode: apiError.statusCode,
          message: apiError.message,
          data: {
            ...apiError.data,
            code: apiError.code,
          },
        })
      }

      // Return full ApiResponse format
      if (isNewFormat) {
        return responseData as ApiResponse<T>
      }

      // Fallback for old format (shouldn't happen with new backend)
      // Wrap in new format for consistency
      return {
        data: responseData as T,
        meta: undefined,
        status: response.status,
      } as ApiResponse<T>
    } catch (error) {
      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw createError({
          statusCode: 408,
          message: `Request timeout after ${options.timeout}ms`,
          data: {
            url,
            timeout: options.timeout,
          },
        })
      }

      // Handle other errors
      const apiError = handleApiError(error, endpoint, baseURL)
      throw createError({
        statusCode: apiError.statusCode,
        message: apiError.message,
        data: {
          ...apiError.data,
          code: apiError.code,
        },
      })
    }
  }

  /**
   * GET request
   */
  const get = <T = unknown>(endpoint: string, headers?: Record<string, string>) => {
    return request<T>(endpoint, {
      method: 'GET',
      headers,
    })
  }

  /**
   * POST request
   */
  const post = <T = unknown>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    })
  }

  /**
   * PATCH request
   */
  const patch = <T = unknown>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) => {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    })
  }

  /**
   * PUT request
   */
  const put = <T = unknown>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    })
  }

  /**
   * DELETE request
   */
  const del = <T = unknown>(endpoint: string, headers?: Record<string, string>) => {
    return request<T>(endpoint, {
      method: 'DELETE',
      headers,
    })
  }

  return {
    request,
    get,
    post,
    patch,
    put,
    delete: del,
    baseURL,
  }
}

// Export types
export type { ApiError }
