import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { LoginInput } from '@auth/composables/auth/schemas'

export function useLogin() {
  const { t } = useI18n()
  const toast = useToast()
  const router = useRouter()

  const state = reactive<LoginInput>({
    email: '',
    password: '',
  })

  const isLoading = ref(false)

  const schema = z.object({
    email: z
      .string({ required_error: t('auth.validation.email-required') })
      .email(t('auth.validation.email-invalid')),
    password: z
      .string({ required_error: t('auth.validation.password-required') })
      .min(6, t('auth.validation.password-min', { min: 6 })),
  })

  async function handleSubmit(event: FormSubmitEvent<LoginInput>) {
    isLoading.value = true

    try {
      // TODO: Implement API call
      // const response = await $fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: event.data,
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.add({
        title: t('auth.login-success-title', 'Đăng nhập thành công'),
        description: t('auth.login-success-description', 'Chào mừng bạn trở lại!'),
        color: 'success',
      })

      // Redirect to dashboard
      await router.push('/dashboard')
    } catch (error: any) {
      toast.add({
        title: t('auth.login-error-title', 'Đăng nhập thất bại'),
        description: error.message || t('auth.login-error-description', 'Email hoặc mật khẩu không đúng'),
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

