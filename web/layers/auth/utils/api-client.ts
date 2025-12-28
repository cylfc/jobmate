/**
 * API Client Utility
 * Utility for making requests to backend API
 * Used in server API routes only
 */

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
   */
  const request = async <T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const url = `${baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw createError({
          statusCode: response.status,
          message: data.message || response.statusText || 'Request failed',
          data: data,
        })
      }

      return data as T
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

