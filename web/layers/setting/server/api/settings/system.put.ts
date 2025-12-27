import { z } from 'zod'
import type { SystemConfig } from '@setting/types/setting'

const systemConfigSchema = z.object({
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.enum(['12h', '24h']),
  language: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = systemConfigSchema.parse(body)

    // TODO: Implement actual system config update logic
    // For now, return the validated data
    const updatedConfig: SystemConfig = {
      timezone: validated.timezone,
      dateFormat: validated.dateFormat,
      timeFormat: validated.timeFormat,
      language: validated.language,
      theme: validated.theme,
    }

    return {
      config: updatedConfig,
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
      message: 'Failed to update system config',
    })
  }
})

