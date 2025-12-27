import { z } from 'zod'
import type { UserProfile } from '@setting/types/setting'

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = profileSchema.parse(body)

    // TODO: Implement actual profile update logic
    // For now, return the validated data
    const updatedProfile: UserProfile = {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone,
      bio: validated.bio,
    }

    return {
      profile: updatedProfile,
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
      message: 'Failed to update profile',
    })
  }
})

