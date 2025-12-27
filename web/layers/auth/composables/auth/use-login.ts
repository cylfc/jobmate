import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { LoginInput } from '@auth/composables/auth/schemas'
import { useAuthApi } from '@auth/utils/auth-api'

export function useLogin() {
  const { t } = useI18n()
  const toast = useToast()
  const router = useRouter()
  const api = useAuthApi()

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

  async function handleSubmit(_event: FormSubmitEvent<LoginInput>) {
    isLoading.value = true

    try {
      const response = await api.login(state)

      // TODO: Store auth state (token, user info, etc.)
      // For example: useAuthState().setAuth(response.user, response.token)

      toast.add({
        title: t('auth.login-success-title', 'Đăng nhập thành công'),
        description: t('auth.login-success-description', 'Chào mừng bạn trở lại!'),
        color: 'success',
      })

      // Redirect to dashboard
      await router.push('/dashboard')
    } catch (error: unknown) {
      toast.add({
        title: t('auth.login-error-title', 'Đăng nhập thất bại'),
        description: (error as Error).message || t('auth.login-error-description', 'Email hoặc mật khẩu không đúng'),
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

