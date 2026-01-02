/**
 * API Plugin
 * Provides a custom $fetch instance with automatic Authorization header
 * Handles token refresh on 401 errors
 * Client-side only
 * 
 * Reference: https://nuxt.com/docs/api/utils/dollarfetch
 */
import { useAuthStore } from '../stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const router = useRouter()

  // Initialize auth store if needed
  if (import.meta.client && !authStore.accessToken) {
    authStore.init()
  }

  // Track if we're currently refreshing token to prevent multiple simultaneous refreshes
  let isRefreshing = false
  let refreshPromise: Promise<{ token: string; refreshToken: string }> | null = null

  const api = $fetch.create({
    // Intercept request to add Authorization header
    async onRequest({ request, options }) {
      // Get access token from auth store
      const accessToken = authStore.accessToken

      // Get URL from request
      const url = typeof request === 'string' ? request : request.url
      
      // Skip adding token for auth endpoints (login, register, refresh)
      const isAuthEndpoint = url.includes('/api/auth/login') ||
                            url.includes('/api/auth/register') ||
                            url.includes('/api/auth/refresh')

      // Add Authorization header if token exists and not an auth endpoint
      if (accessToken && !isAuthEndpoint) {
        // Merge headers safely, but remove any existing Authorization header first
        const existingHeaders = options.headers || {}
        const headersObj = existingHeaders instanceof Headers
          ? Object.fromEntries(existingHeaders.entries())
          : (existingHeaders as Record<string, string>)
        
        // Remove any existing Authorization header to prevent duplicates
        const { Authorization: _, ...headersWithoutAuth } = headersObj
        
        options.headers = {
          ...headersWithoutAuth,
          Authorization: `Bearer ${accessToken}`,
        } as unknown as Headers
      }
    },

    // Intercept errors (e.g., handle 401 Unauthorized)
    async onResponseError({ response, request, options }): Promise<void> {
      if (response.status === 401) {
        // Skip if this is already an auth endpoint (to avoid infinite loop)
        const url = typeof request === 'string' ? request : request.url
        const isAuthEndpoint = url.includes('/api/auth/login') ||
                              url.includes('/api/auth/register') ||
                              url.includes('/api/auth/refresh')

        if (isAuthEndpoint) {
          return
        }

        // Try to refresh token if we have a refresh token
        if (authStore.refreshToken) {
          try {
            // If already refreshing, wait for the existing refresh to complete
            if (isRefreshing && refreshPromise) {
              await refreshPromise
              // After waiting, retry the original request with the new token
              const requestUrl = typeof request === 'string' ? request : request.url
              const existingHeaders = options.headers || {}
              const headersObj = existingHeaders instanceof Headers
                ? Object.fromEntries(existingHeaders.entries())
                : (existingHeaders as Record<string, string>)
              
              const { Authorization: _, ...headersWithoutAuth } = headersObj
              
              const retryResponse = await api(requestUrl, {
                ...options,
                headers: {
                  ...headersWithoutAuth,
                  Authorization: `Bearer ${authStore.accessToken}`,
                } as unknown as Headers,
              } as Parameters<typeof api>[1])

              const responseObj = response as { _data?: unknown; status?: number; statusText?: string; ok?: boolean }
              responseObj._data = retryResponse
              responseObj.status = 200
              responseObj.statusText = 'OK'
              responseObj.ok = true
              
              return
            }

            // Start refresh process
            isRefreshing = true
            refreshPromise = $fetch<{ token: string; refreshToken: string }>(
              '/api/auth/refresh',
              {
                method: 'POST',
                body: { refreshToken: authStore.refreshToken },
              }
            )

            const tokens = await refreshPromise
            
            authStore.updateTokens({
              accessToken: tokens.token,
              refreshToken: tokens.refreshToken,
            })

            // Reset refresh state
            isRefreshing = false
            refreshPromise = null

            // Retry the original request with new token
            const requestUrl = typeof request === 'string' ? request : request.url
            const existingHeaders = options.headers || {}
            const headersObj = existingHeaders instanceof Headers
              ? Object.fromEntries(existingHeaders.entries())
              : (existingHeaders as Record<string, string>)
            
            // Remove old Authorization header to prevent duplicate tokens
            // Create a new headers object without the old Authorization
            const { Authorization: _, ...headersWithoutAuth } = headersObj
            
            // Retry the request with only the new token
            const retryResponse = await api(requestUrl, {
              ...options,
              headers: {
                ...headersWithoutAuth,
                Authorization: `Bearer ${tokens.token}`,
              } as unknown as Headers,
            } as Parameters<typeof api>[1])

            // Replace the error response with the successful response
            // $fetch uses response._data to return the data
            // We need to modify the response object to return the retry response
            const responseObj = response as { _data?: unknown; status?: number; statusText?: string; ok?: boolean }
            responseObj._data = retryResponse
            responseObj.status = 200
            responseObj.statusText = 'OK'
            responseObj.ok = true
            
            // Return early to prevent logout/redirect
            return
          } catch (refreshError) {
            // Reset refresh state on error
            isRefreshing = false
            refreshPromise = null
            
            // Refresh failed or retry failed, logout user
            console.error('Token refresh failed:', refreshError)
            authStore.logout()
            
            // Redirect to login page if not already there
            if (router.currentRoute.value.path !== '/auth/login') {
              await navigateTo({
                path: '/auth/login',
                query: {
                  redirect: router.currentRoute.value.fullPath,
                },
              })
            }
            return
          }
        } else {
          // No refresh token, logout
          authStore.logout()
          
          // Redirect to login page if not already there
          if (router.currentRoute.value.path !== '/auth/login') {
            await navigateTo({
              path: '/auth/login',
              query: {
                redirect: router.currentRoute.value.fullPath,
              },
            })
          }
        }
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})

