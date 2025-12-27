import type { NotificationSettings } from '@setting/types/setting'

export default defineEventHandler(async (event) => {
  try {
    // TODO: Implement actual notification settings fetching logic
    // For now, return mock data
    const mockSettings: NotificationSettings = {
      emailJobMatches: true,
      emailNewCandidates: true,
      emailWeeklyDigest: false,
      pushJobMatches: true,
      pushNewCandidates: true,
      pushMessages: true,
      inAppJobMatches: true,
      inAppNewCandidates: true,
      inAppMessages: true,
    }

    return {
      settings: mockSettings,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch notification settings',
    })
  }
})

