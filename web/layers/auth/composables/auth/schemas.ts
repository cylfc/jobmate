import { z } from 'zod'

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email('Email không hợp lệ'),
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Register Schema
 */
export const registerSchema = z
  .object({
    firstName: z
      .string({ required_error: 'Họ là bắt buộc' })
      .min(2, 'Họ phải có ít nhất 2 ký tự'),
    lastName: z
      .string({ required_error: 'Tên là bắt buộc' })
      .min(2, 'Tên phải có ít nhất 2 ký tự'),
    email: z
      .string({ required_error: 'Email là bắt buộc' })
      .email('Email không hợp lệ'),
    password: z
      .string({ required_error: 'Mật khẩu là bắt buộc' })
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      ),
    confirmPassword: z.string({ required_error: 'Xác nhận mật khẩu là bắt buộc' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email('Email không hợp lệ'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/**
 * Change Password Schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Mật khẩu hiện tại là bắt buộc' })
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    newPassword: z
      .string({ required_error: 'Mật khẩu mới là bắt buộc' })
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      ),
    confirmPassword: z.string({ required_error: 'Xác nhận mật khẩu là bắt buộc' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

