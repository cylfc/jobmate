/**
 * @deprecated This file is deprecated. Please use @shared/api instead.
 *
 * This file is kept for backward compatibility only.
 * All new code should import from @shared/api:
 *
 * ```typescript
 * import { useApiClient } from '@shared/api'
 * ```
 *
 * Migration: Replace `@auth/utils/api-client` with `@shared/api` in all imports.
 */

// Re-export from shared location for backward compatibility
export { useApiClient, type ApiError } from "@shared/api";
