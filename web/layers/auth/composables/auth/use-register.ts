import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { RegisterInput } from '@auth/composables/auth/schemas'

export function useRegister() {
  const { t } = useI18n()
  const toast = useToast()
  const router = useRouter()

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

  async function handleSubmit(event: FormSubmitEvent<RegisterInput>) {
    isLoading.value = true

    try {
      // TODO: Implement API call
      // const response = await $fetch('/api/auth/register', {
      //   method: 'POST',
      //   body: {
      //     firstName: event.data.firstName,
      //     lastName: event.data.lastName,
      //     email: event.data.email,
      //     password: event.data.password,
      //   },
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.add({
        title: t('auth.register-success-title', 'Đăng ký thành công'),
        description: t('auth.register-success-description', 'Tài khoản của bạn đã được tạo thành công!'),
        color: 'success',
      })

      // Redirect to login
      await router.push('/auth/login')
    } catch (error: any) {
      toast.add({
        title: t('auth.register-error-title', 'Đăng ký thất bại'),
        description: error.message || t('auth.register-error-description', 'Có lỗi xảy ra khi đăng ký'),
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

