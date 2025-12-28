/**
 * Auth Middleware
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware((to, _from) => {
  // Skip middleware on server side
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()

  // Initialize auth store if not already initialized
  if (!authStore.accessToken) {
    authStore.init()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Redirect to login page
    return navigateTo({
      path: '/auth/login',
      query: {
        redirect: to.fullPath,
      },
    })
  }
})

