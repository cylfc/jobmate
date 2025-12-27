import type { SystemConfig } from '@setting/types/setting'

export default defineEventHandler(async (event) => {
  try {
    // TODO: Implement actual system config fetching logic
    // For now, return mock data with defaults
    const mockConfig: SystemConfig = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      language: 'en',
      theme: 'auto',
    }

    return {
      config: mockConfig,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch system config',
    })
  }
})

