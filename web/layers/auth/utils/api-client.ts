/**
 * API Client Utility
 * Utility for making requests to backend API
 * Used in server API routes only
 * Backend returns format: { data, meta, status }
 */

import type { ApiResponse } from '../../../types/api-response'

export interface ApiError {
  statusCode: number
  message: string
  data?: unknown
}

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const baseURL = config.apiBaseUrl || 'http://localhost:3000'

  /**
   * Make a request to backend API
   * Returns full ApiResponse format: { data, meta, status }
   */
  const request = async <T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> => {
    const url = `${baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        },
      })

      const responseData = await response.json().catch(() => ({}))

      // Check if response follows new format { data, meta, status }
      const isNewFormat = responseData && 
                          typeof responseData === 'object' && 
                          'data' in responseData && 
                          'status' in responseData

      if (!response.ok) {
        // Handle error response in new format
        if (isNewFormat) {
          const errorMeta = (responseData as ApiResponse<null>).meta as { error?: { message?: string } } | undefined
          const errorMessage = errorMeta?.error?.message || response.statusText || 'Request failed'
          
          throw createError({
            statusCode: (responseData as ApiResponse<null>).status || response.status,
            message: errorMessage,
            data: responseData,
          })
        }
        
        // Fallback for old format
        throw createError({
          statusCode: response.status,
          message: (responseData as { message?: string }).message || response.statusText || 'Request failed',
          data: responseData,
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
      // Re-throw if it's already a Nuxt error
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error
      }

      // Handle network errors
      throw createError({
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Network error',
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
  }
}

