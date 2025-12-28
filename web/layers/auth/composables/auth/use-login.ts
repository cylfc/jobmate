import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { LoginInput } from '@auth/composables/auth/schemas'
import { useAuthApi } from '@auth/utils/auth-api'
import { useAuthStore } from '@auth/stores/auth'

export function useLogin() {
  const { t } = useI18n()
  const toast = useToast()
  const router = useRouter()
  const api = useAuthApi()
  const authStore = useAuthStore()

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
      .min(1, t('auth.validation.password-required')),
  })

  async function handleSubmit(_event: FormSubmitEvent<LoginInput>) {
    isLoading.value = true

    try {
      const response = await api.login(state)

      // Store auth state
      await authStore.login(response.user, {
        accessToken: response.token,
        refreshToken: response.refreshToken,
      })

      toast.add({
        title: t('auth.login-success-title', 'Đăng nhập thành công'),
        description: t('auth.login-success-description', 'Chào mừng bạn trở lại!'),
        color: 'success',
      })

      // Redirect to dashboard
      await router.push('/dashboard')
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : t('auth.login-error-description', 'Email hoặc mật khẩu không đúng')

      toast.add({
        title: t('auth.login-error-title', 'Đăng nhập thất bại'),
        description: errorMessage,
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

