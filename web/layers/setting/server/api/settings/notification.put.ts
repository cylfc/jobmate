import { z } from 'zod'
import type { NotificationSettings } from '@setting/types/setting'

const notificationSchema = z.object({
  emailJobMatches: z.boolean(),
  emailNewCandidates: z.boolean(),
  emailWeeklyDigest: z.boolean(),
  pushJobMatches: z.boolean(),
  pushNewCandidates: z.boolean(),
  pushMessages: z.boolean(),
  inAppJobMatches: z.boolean(),
  inAppNewCandidates: z.boolean(),
  inAppMessages: z.boolean(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = notificationSchema.parse(body)

    // TODO: Implement actual notification settings update logic
    // For now, return the validated data
    const updatedSettings: NotificationSettings = {
      emailJobMatches: validated.emailJobMatches,
      emailNewCandidates: validated.emailNewCandidates,
      emailWeeklyDigest: validated.emailWeeklyDigest,
      pushJobMatches: validated.pushJobMatches,
      pushNewCandidates: validated.pushNewCandidates,
      pushMessages: validated.pushMessages,
      inAppJobMatches: validated.inAppJobMatches,
      inAppNewCandidates: validated.inAppNewCandidates,
      inAppMessages: validated.inAppMessages,
    }

    return {
      settings: updatedSettings,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input',
        data: error.errors,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update notification settings',
    })
  }
})

