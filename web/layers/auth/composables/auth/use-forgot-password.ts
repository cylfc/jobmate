import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { ForgotPasswordInput } from '@auth/composables/auth/schemas'

export function useForgotPassword() {
  const { t } = useI18n()
  const toast = useToast()

  const state = reactive<ForgotPasswordInput>({
    email: '',
  })

  const isLoading = ref(false)
  const isEmailSent = ref(false)

  const schema = z.object({
    email: z
      .string({ required_error: t('auth.validation.email-required') })
      .email(t('auth.validation.email-invalid')),
  })

  async function handleSubmit(_event: FormSubmitEvent<ForgotPasswordInput>) {
    isLoading.value = true

    try {
      // TODO: Implement API call
      // const response = await $fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   body: event.data,
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      isEmailSent.value = true

      toast.add({
        title: t('auth.forgot-password-success-title', 'Email đã được gửi'),
        description: t('auth.forgot-password-success-description', 'Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu'),
        color: 'success',
      })
    } catch (error: unknown) {
      toast.add({
        title: t('auth.forgot-password-error-title', 'Gửi email thất bại'),
        description: error.message || t('auth.forgot-password-error-description', 'Có lỗi xảy ra khi gửi email'),
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
    isEmailSent,
    handleSubmit,
  }
}

