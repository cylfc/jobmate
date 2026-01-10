/**
 * Auth Initialization Plugin
 * Initialize auth store from localStorage on app startup
 * Client-side only
 */
import { useAuthStore } from "@auth/stores/auth";

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  // Initialize auth state from localStorage
  if (import.meta.client) {
    authStore.init();
  }
});
