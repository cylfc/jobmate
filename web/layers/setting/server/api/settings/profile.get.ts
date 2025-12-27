import type { UserProfile } from '@setting/types/setting'

export default defineEventHandler(async (event) => {
  try {
    // TODO: Implement actual profile fetching logic
    // For now, return mock data
    const mockProfile: UserProfile = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+84 123 456 789',
      bio: 'Software developer with 5+ years of experience',
    }

    return {
      profile: mockProfile,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch profile',
    })
  }
})

