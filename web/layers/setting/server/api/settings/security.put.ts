import { z } from 'zod'
import type { SecuritySettings } from '@setting/types/setting'

const securitySchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  loginNotifications: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = securitySchema.parse(body)

    // TODO: Implement actual security settings update logic
    // For now, return the validated data
    const updatedSettings: SecuritySettings = {
      twoFactorEnabled: validated.twoFactorEnabled,
      sessionTimeout: validated.sessionTimeout,
      loginNotifications: validated.loginNotifications,
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
      message: 'Failed to update security settings',
    })
  }
})

