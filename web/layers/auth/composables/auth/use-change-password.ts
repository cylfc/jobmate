import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { ChangePasswordInput } from '@auth/composables/auth/schemas'

export function useChangePassword() {
  const { t } = useI18n()
  const toast = useToast()

  const state = reactive<ChangePasswordInput>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const isLoading = ref(false)

  const schema = z
    .object({
      currentPassword: z
        .string({ required_error: t('auth.validation.current-password-required') })
        .min(6, t('auth.validation.current-password-min')),
      newPassword: z
        .string({ required_error: t('auth.validation.new-password-required') })
        .min(8, t('auth.validation.new-password-min'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          t('auth.validation.new-password-pattern'),
        ),
      confirmPassword: z.string({ required_error: t('auth.validation.confirm-password-required') }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('auth.validation.confirm-password-mismatch'),
      path: ['confirmPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: t('auth.validation.new-password-same'),
      path: ['newPassword'],
    })

  async function handleSubmit(_event: FormSubmitEvent<ChangePasswordInput>) {
    isLoading.value = true

    try {
      // TODO: Implement API call
      // const response = await $fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   body: {
      //     currentPassword: event.data.currentPassword,
      //     newPassword: event.data.newPassword,
      //   },
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.add({
        title: t('auth.change-password-success-title', 'Đổi mật khẩu thành công'),
        description: t('auth.change-password-success-description', 'Mật khẩu của bạn đã được cập nhật'),
        color: 'success',
      })

      // Reset form
      state.currentPassword = ''
      state.newPassword = ''
      state.confirmPassword = ''

      // Optionally redirect
      // await router.push('/dashboard')
    } catch (error: unknown) {
      toast.add({
        title: t('auth.change-password-error-title', 'Đổi mật khẩu thất bại'),
        description: error.message || t('auth.change-password-error-description', 'Mật khẩu hiện tại không đúng'),
        color: 'error',
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    schema,
    state,
    isLoading,
    handleSubmit,
  }
}

