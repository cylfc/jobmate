/**
 * Use Create Candidate Chat Handler
 * Handles chat interactions for create candidate feature
 */
import type { ChatHandler, ChatMessage, ChatContext } from '@chat/types/chat'
import { useCandidate } from '@candidate/composables/use-candidate'
import { createCreateCandidateScript } from '@chat/scripts/create-candidate-script'
import type { CreateCandidateInput, Candidate } from '@candidate/types/candidate'

export const useCreateCandidateChatHandler = (): ChatHandler => {
  const { t } = useI18n()
  const candidateOps = useCandidate()
  
  // Use local state with refs (similar to matching handler pattern)
  // This avoids Pinia store setup context issues
  const currentStep = ref(0)
  const inputMethod = ref<'text' | 'upload' | null>(null)
  const rawInput = ref<{
    text?: string
    files?: File[]
  }>({
    text: undefined,
    files: undefined,
  })
  const parsedCandidate = ref<CreateCandidateInput | null>(null)
  const errors = ref<Record<string, string>>({})
  const isParsing = ref(false)
  const isSaving = ref(false)
  const createdCandidate = ref<Candidate | null>(null)
  
  // Computed getters
  const hasInput = computed(() => {
    return !!(rawInput.value.text || (rawInput.value.files && rawInput.value.files.length > 0))
  })
  
  const isValid = computed(() => {
    if (!parsedCandidate.value) return false
    const { firstName, lastName, email } = parsedCandidate.value
    return !!(firstName && lastName && email)
  })
  
  // State management functions
  const setCurrentStep = (step: number) => {
    currentStep.value = step
  }
  
  const setInputMethod = (method: 'text' | 'upload' | null) => {
    inputMethod.value = method
  }
  
  const setRawText = (text: string) => {
    rawInput.value.text = text
  }
  
  const setRawFiles = (files: File[]) => {
    rawInput.value.files = files
  }
  
  const setParsedCandidate = (candidate: CreateCandidateInput | null) => {
    parsedCandidate.value = candidate
  }
  
  const setErrors = (errs: Record<string, string>) => {
    errors.value = errs
  }
  
  const setError = (key: string, message: string) => {
    errors.value[key] = message
  }
  
  const clearError = (key: string) => {
    const newErrors: Record<string, string> = {}
    for (const k in errors.value) {
      if (k !== key && errors.value[k]) {
        newErrors[k] = errors.value[k]
      }
    }
    errors.value = newErrors
  }
  
  const clearErrors = () => {
    errors.value = {}
  }
  
  const setParsing = (parsing: boolean) => {
    isParsing.value = parsing
  }
  
  const setSaving = (saving: boolean) => {
    isSaving.value = saving
  }
  
  const setCreatedCandidate = (candidate: Candidate | null) => {
    createdCandidate.value = candidate
  }
  
  const reset = () => {
    currentStep.value = 0
    inputMethod.value = null
    rawInput.value = {
      text: undefined,
      files: undefined,
    }
    parsedCandidate.value = null
    errors.value = {}
    isParsing.value = false
    isSaving.value = false
    createdCandidate.value = null
  }
  
  // State object for easier access
  const state = {
    currentStep,
    inputMethod,
    rawInput,
    parsedCandidate,
    errors,
    isParsing,
    isSaving,
    createdCandidate,
    hasInput,
    isValid,
    setCurrentStep,
    setInputMethod,
    setRawText,
    setRawFiles,
    setParsedCandidate,
    setErrors,
    setError,
    clearError,
    clearErrors,
    setParsing,
    setSaving,
    setCreatedCandidate,
    reset,
  }

  const getInitialMessage = (): string => {
    return t('chat.create-candidate.welcome', {
      defaultValue: 'Xin chào! Tôi sẽ giúp bạn tạo ứng viên mới. Hãy bắt đầu bằng cách cung cấp thông tin về ứng viên.',
    })
  }

  const _getInitialMessageWithComponent = (): ChatMessage => {
    const script = createCreateCandidateScript(t)
    const firstStep = script.steps[0]
    if (!firstStep) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: getInitialMessage(),
        timestamp: new Date(),
      }
    }
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: firstStep.message,
      timestamp: new Date(),
      component: firstStep.component,
    }
  }

  const getStepMessage = (step: number): string => {
    switch (step) {
      case 1:
        return t('chat.create-candidate.step-1.prompt', {
          defaultValue: 'Vui lòng cung cấp thông tin về ứng viên. Bạn có thể:\n- Nhập thông tin trực tiếp\n- Upload CV',
        })
      case 2:
        return t('chat.create-candidate.step-2.prompt', {
          defaultValue: 'Vui lòng nhập thông tin ứng viên vào ô chat phía dưới hoặc upload CV:',
        })
      case 3:
        return t('chat.create-candidate.step-3.prompt', {
          defaultValue: 'Đang phân tích thông tin ứng viên...',
        })
      case 4:
        return t('chat.create-candidate.step-4.prompt', {
          defaultValue: 'Xác nhận và lưu thông tin ứng viên?',
        })
      default:
        return ''
    }
  }

  const canGoBack = (currentStep: number): boolean => {
    return currentStep > 1
  }

  const getTotalSteps = (): number => {
    return 4
  }

  const getScript = () => {
    return createCreateCandidateScript(t)
  }

  const handleMessage = async (message: string, chatContext: ChatContext): Promise<ChatMessage | null> => {
    const currentStepIndex = chatContext.data?.stepIndex || 0
    const script = createCreateCandidateScript(t)
    const currentStep = script.steps[currentStepIndex]
    const stepId = currentStep?.id || ''

    try {
      // Step 1: Select input method - if user sends text, treat as prompt input
      if (stepId === 'step-1-select-method') {
        // User sent text directly, treat as prompt input
        return await handleStep2InputCandidate(message, chatContext)
      }

      // Step 2: Input candidate data
      if (stepId === 'step-2-input-candidate') {
        return await handleStep2InputCandidate(message, chatContext)
      }

      // Step 3: Parse & Review
      if (stepId === 'step-3-parse-review') {
        return await handleStep3(message, chatContext)
      }

      // Step 4: Confirm & Save
      if (stepId === 'step-4-confirm-save') {
        return await handleStep4(message, chatContext)
      }

      return null
    } catch (error) {
      console.error('Error handling message:', error)
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.error', {
          defaultValue: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        }),
        timestamp: new Date(),
      }
    }
  }

  const handleComponentUpdate = async (
    messageId: string,
    data: Record<string, unknown>,
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    const currentStepIndex = chatContext.data?.stepIndex || 0
    const script = createCreateCandidateScript(t)
    const currentStep = script.steps[currentStepIndex]
    const stepId = currentStep?.id || ''

    // Validate step data
    if (currentStep?.validation) {
      const validationResult = currentStep.validation(data)
      if (validationResult !== true) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: typeof validationResult === 'string' ? validationResult : t('chat.components.messages.invalid-data', {
            defaultValue: 'Dữ liệu không hợp lệ',
          }),
          timestamp: new Date(),
        }
      }
    }

    try {
      // Step 1: Method selected
      if (stepId === 'step-1-select-method') {
        return await handleStep1MethodSelected(data, chatContext)
      }

      // Step 3 or 4: Form submitted (from candidate-form-preview)
      if (stepId === 'step-3-parse-review' || stepId === 'step-4-confirm-save') {
        if (data.action === 'submit' && data.candidate) {
          // Update parsed candidate with form data
          const candidateData = data.candidate as CreateCandidateInput
          state.setParsedCandidate(candidateData)
          // Move to save step
          return await handleStep4('save', chatContext)
        } else if (data.action === 'cancel') {
          state.reset()
          return {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: t('chat.create-candidate.step-4.cancelled', {
              defaultValue: 'Đã hủy tạo ứng viên.',
            }),
            timestamp: new Date(),
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error handling component update:', error)
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.error', {
          defaultValue: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        }),
        timestamp: new Date(),
      }
    }
  }

  const handleStep1MethodSelected = async (
    data: Record<string, unknown>,
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    const script = createCreateCandidateScript(t)
    const method = (data.method as 'text' | 'upload' | null) || null

    // Store method in state
    state.setInputMethod(method)

    // Store method in context
    chatContext.data = {
      ...chatContext.data,
      candidateInputMethod: method,
    }

    if (method === 'upload') {
      // If files are already uploaded, process them
      const uploadData = data.data as { files?: File[] } | undefined
      if (uploadData?.files && uploadData.files.length > 0) {
        return await handleStep2UploadSelected(uploadData.files, chatContext)
      }
      // Otherwise, component will show upload handler
      return null
    }

    // If method is prompt/text, move to input step
    const nextStepIndex = 1
    chatContext.data.stepIndex = nextStepIndex
    const nextStep = script.steps[nextStepIndex]
    if (!nextStep) {
      return null
    }
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: nextStep.message,
      timestamp: new Date(),
    }
  }

  const handleStep2UploadSelected = async (
    files: File[],
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    if (files.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.components.file-upload.select-file', {
          defaultValue: 'Vui lòng chọn file để upload.',
        }),
        timestamp: new Date(),
      }
    }

    // Store files in state
    state.setRawFiles(files)
    state.setInputMethod('upload')

    // Store files in context
    chatContext.data = {
      ...chatContext.data,
      candidateFiles: files,
    }

    // Move to parse step
    const nextStepIndex = 2
    chatContext.data = {
      ...chatContext.data,
      stepIndex: nextStepIndex,
    }
    return await handleStep3('', chatContext)
  }

  const handleStep2InputCandidate = async (
    message: string,
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    // Store text in state
    state.setRawText(message)
    state.setInputMethod('text')

    // Store text in context
    chatContext.data = {
      ...chatContext.data,
      candidateText: message,
    }

    // Move to parse step
    const nextStepIndex = 2
    chatContext.data = {
      ...chatContext.data,
      stepIndex: nextStepIndex,
    }
    return await handleStep3(message, chatContext)
  }

  const handleStep3 = async (_message: string, chatContext: ChatContext): Promise<ChatMessage | null> => {
    // Check if we have input data
    if (!state.hasInput.value) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.step-3.missing-data', {
          defaultValue: 'Thiếu thông tin ứng viên. Vui lòng quay lại bước trước.',
        }),
        timestamp: new Date(),
      }
    }

    // Start parsing
    state.setParsing(true)
    state.clearErrors()

    try {
      let parsedCandidate: CreateCandidateInput | null = null

      // Parse based on input method
      if (state.inputMethod.value === 'upload' && state.rawInput.value.files && state.rawInput.value.files.length > 0) {
        // For file upload, we need to read file content first
        // For now, use the first file
        const file = state.rawInput.value.files?.[0]
        if (!file) {
          state.setParsing(false)
          return {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: t('chat.create-candidate.step-3.no-file', {
              defaultValue: 'Không tìm thấy file. Vui lòng thử lại.',
            }),
            timestamp: new Date(),
          }
        }
        const text = await readFileAsText(file)
        parsedCandidate = await candidateOps.parseCandidateFromText(text)
      } else if (state.inputMethod.value === 'text' && state.rawInput.value.text) {
        // Parse from text
        parsedCandidate = await candidateOps.parseCandidateFromText(state.rawInput.value.text)
      }

      if (!parsedCandidate) {
        state.setParsing(false)
        state.setError('parse', t('chat.create-candidate.step-3.parse-error', {
          defaultValue: 'Không thể phân tích thông tin ứng viên. Vui lòng thử lại.',
        }))
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: t('chat.create-candidate.step-3.parse-error', {
            defaultValue: 'Không thể phân tích thông tin ứng viên. Vui lòng thử lại.',
          }),
          timestamp: new Date(),
        }
      }

      // Validate parsed candidate
      if (!parsedCandidate.firstName || !parsedCandidate.lastName || !parsedCandidate.email) {
        state.setParsing(false)
        state.setError('validation', t('chat.create-candidate.step-3.validation-error', {
          defaultValue: 'Thông tin ứng viên không đầy đủ. Vui lòng cung cấp ít nhất: Họ tên và Email.',
        }))
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: t('chat.create-candidate.step-3.validation-error', {
            defaultValue: 'Thông tin ứng viên không đầy đủ. Vui lòng cung cấp ít nhất: Họ tên và Email.',
          }),
          timestamp: new Date(),
        }
      }

      // Store parsed candidate
      state.setParsedCandidate(parsedCandidate)
      state.setParsing(false)

      // Move to confirm step with form preview
      const nextStepIndex = 3
      chatContext.data = {
        ...chatContext.data,
        stepIndex: nextStepIndex,
      }
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.step-3.success', {
          defaultValue: 'Đã phân tích thành công! Vui lòng xem và chỉnh sửa thông tin ứng viên bên dưới:',
        }),
        timestamp: new Date(),
        component: {
          type: 'candidate-form-preview',
          props: {
            candidate: parsedCandidate,
            isSaving: false,
          },
        },
      }
    } catch (error) {
      console.error('Error parsing candidate:', error)
      state.setParsing(false)
      state.setError('parse', t('chat.create-candidate.step-3.parse-error', {
        defaultValue: 'Không thể phân tích thông tin ứng viên. Vui lòng thử lại.',
      }))
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.step-3.parse-error', {
          defaultValue: 'Không thể phân tích thông tin ứng viên. Vui lòng thử lại.',
        }),
        timestamp: new Date(),
      }
    }
  }

  const handleStep4 = async (message: string, _chatContext: ChatContext): Promise<ChatMessage | null> => {
    // Check if user confirmed (message contains "save", "yes", "confirm", etc.)
    const confirmKeywords = ['save', 'lưu', 'yes', 'có', 'confirm', 'xác nhận', 'ok', 'okay']
    const cancelKeywords = ['cancel', 'hủy', 'no', 'không']

    const lowerMessage = message.toLowerCase().trim()
    const isConfirmed = confirmKeywords.some(keyword => lowerMessage.includes(keyword))
    const isCancelled = cancelKeywords.some(keyword => lowerMessage.includes(keyword))

    if (isCancelled) {
      state.reset()
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.step-4.cancelled', {
          defaultValue: 'Đã hủy tạo ứng viên.',
        }),
        timestamp: new Date(),
      }
    }

    if (!isConfirmed && !isCancelled) {
      // If not clear, ask for confirmation
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.step-4.confirm-required', {
          defaultValue: 'Vui lòng xác nhận: Gõ "lưu" để lưu ứng viên hoặc "hủy" để hủy.',
        }),
        timestamp: new Date(),
      }
    }

    // Validate before saving
    if (!state.isValid.value || !state.parsedCandidate.value) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.step-4.invalid-data', {
          defaultValue: 'Thông tin ứng viên không hợp lệ. Vui lòng quay lại bước trước.',
        }),
        timestamp: new Date(),
      }
    }

    // Start saving
    state.setSaving(true)
    state.clearErrors()

    try {
      const createdCandidate = await candidateOps.createCandidate(state.parsedCandidate.value)
      state.setCreatedCandidate(createdCandidate)
      state.setSaving(false)

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.step-4.success', {
          defaultValue: `Đã tạo ứng viên thành công!\n- Họ tên: ${createdCandidate.firstName} ${createdCandidate.lastName}\n- Email: ${createdCandidate.email}\n- ID: ${createdCandidate.id}`,
        }),
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Error creating candidate:', error)
      state.setSaving(false)
      state.setError('save', t('chat.create-candidate.step-4.save-error', {
        defaultValue: 'Không thể lưu ứng viên. Vui lòng thử lại.',
      }))
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.create-candidate.step-4.save-error', {
          defaultValue: 'Không thể lưu ứng viên. Vui lòng thử lại.',
        }),
        timestamp: new Date(),
      }
    }
  }

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = (e) => {
        reject(e)
      }
      reader.readAsText(file)
    })
  }

  return {
    name: 'Create Candidate',
    feature: 'create-candidate',
    handleMessage,
    handleComponentUpdate,
    getInitialMessage,
    getStepMessage,
    canGoBack,
    getTotalSteps,
    getScript,
  } as ChatHandler & { getScript?: () => ReturnType<typeof createCreateCandidateScript> }
}

