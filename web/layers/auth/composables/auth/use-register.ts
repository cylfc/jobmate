import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { RegisterInput } from '@auth/composables/auth/schemas'
import { useAuthApi } from '@auth/utils/auth-api'

export function useRegister() {
  const { t } = useI18n()
  const toast = useToast()
  const router = useRouter()
  const api = useAuthApi()

  const state = reactive<RegisterInput>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const isLoading = ref(false)

  const schema = z
    .object({
      firstName: z
        .string({ required_error: t('auth.validation.first-name-required') })
        .min(2, t('auth.validation.first-name-min')),
      lastName: z
        .string({ required_error: t('auth.validation.last-name-required') })
        .min(2, t('auth.validation.last-name-min')),
      email: z
        .string({ required_error: t('auth.validation.email-required') })
        .email(t('auth.validation.email-invalid')),
      password: z
        .string({ required_error: t('auth.validation.password-required') })
        .min(8, t('auth.validation.password-min', { min: 8 }))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          t('auth.validation.password-pattern'),
        ),
      confirmPassword: z.string({ required_error: t('auth.validation.confirm-password-required') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.validation.confirm-password-mismatch'),
      path: ['confirmPassword'],
    })

  async function handleSubmit(_event: FormSubmitEvent<RegisterInput>) {
    isLoading.value = true

    try {
      const response = await api.register({
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        password: state.password,
      })

      // TODO: Store auth state (token, user info, etc.)
      // For example: useAuthState().setAuth(response.user, response.token)

      toast.add({
        title: t('auth.register-success-title', 'Đăng ký thành công'),
        description: t('auth.register-success-description', 'Tài khoản của bạn đã được tạo thành công!'),
        color: 'success',
      })

      // Redirect to login
      await router.push('/auth/login')
    } catch (error: unknown) {
      toast.add({
        title: t('auth.register-error-title', 'Đăng ký thất bại'),
        description: (error as Error).message || t('auth.register-error-description', 'Có lỗi xảy ra khi đăng ký'),
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

