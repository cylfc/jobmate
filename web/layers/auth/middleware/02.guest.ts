/**
 * Guest Middleware
 * Redirects authenticated users away from guest-only pages (like login/register)
 * Prevents logged-in users from accessing auth pages
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

  // If user is already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    // Get redirect query param from current route or default to dashboard
    const redirectPath = (to.query.redirect as string) || '/dashboard'
    
    return navigateTo(redirectPath)
  }
})

