/**
 * Use Matching Chat Handler
 * Handles chat interactions for matching feature
 */
import type { ChatHandler, ChatMessage, ChatContext } from '@chat/types/chat'
import { useMatchingState } from '@matching/composables/use-matching-state'
import { useMatchingJob } from '@matching/composables/use-matching-job'
import { useMatchingCandidate } from '@matching/composables/use-matching-candidate'
import { useMatchingAnalysis } from '@matching/composables/use-matching-analysis'
import type { Job, Candidate } from '@matching/types/matching'
import { createMatchingScript } from '@chat/scripts/matching-script'

export const useMatchingChatHandler = (): ChatHandler => {
  const { t } = useI18n()
  const state = useMatchingState()
  const jobOps = useMatchingJob()
  const candidateOps = useMatchingCandidate()
  const analysisOps = useMatchingAnalysis()

  const getInitialMessage = (): string => {
    return t('chat.matching.welcome', {
      defaultValue: 'Xin chào! Tôi sẽ giúp bạn tìm ứng viên phù hợp cho công việc. Hãy bắt đầu bằng cách cung cấp thông tin về công việc của bạn.',
    })
  }

  const getInitialMessageWithComponent = (): ChatMessage => {
    const script = createMatchingScript()
    const firstStep = script.steps[0]
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
        return t('chat.matching.step-1.prompt', {
          defaultValue: 'Vui lòng cung cấp thông tin về công việc. Bạn có thể:\n- Dán mô tả công việc\n- Cung cấp link đến job posting\n- Chọn job từ database',
        })
      case 2:
        return t('chat.matching.step-2.prompt', {
          defaultValue: 'Bây giờ hãy cung cấp thông tin về ứng viên. Bạn có thể:\n- Dán thông tin ứng viên\n- Upload CV\n- Chọn ứng viên từ database',
        })
      case 3:
        return t('chat.matching.step-3.prompt', {
          defaultValue: 'Đang phân tích và so khớp...',
        })
      case 4:
        return t('chat.matching.step-4.prompt', {
          defaultValue: 'Đã hoàn thành phân tích! Đây là kết quả so khớp.',
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
    return createMatchingScript()
  }

  const handleMessage = async (message: string, chatContext: ChatContext): Promise<ChatMessage | null> => {
    const currentStepIndex = chatContext.data?.stepIndex || 0
    const script = createMatchingScript()
    const currentStep = script.steps[currentStepIndex]
    const stepId = currentStep?.id || ''

    try {
      // Step 1: Select job input method
      if (stepId === 'step-1-select-method') {
        // This should be handled by component update, not message
        return null
      }

      // Step 1.5: Input job data (from prompt)
      if (stepId === 'step-1-input-job') {
        return await handleStep1InputJob(message, chatContext)
      }

      // Step 2: Select candidate input method
      if (stepId === 'step-2-select-method') {
        // This should be handled by component update, not message
        return null
      }

      // Step 2.5: Input candidate data (from prompt)
      if (stepId === 'step-2-input-candidate') {
        return await handleStep2InputCandidate(message, chatContext)
      }

      // Step 3: Analysis
      if (stepId === 'step-3') {
        return await handleStep3(message, chatContext)
      }

      // Step 4: Results
      if (stepId === 'step-4') {
        return await handleStep4(message, chatContext)
      }

      return null
    } catch (error) {
      console.error('Error handling message:', error)
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.matching.error', {
          defaultValue: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        }),
        timestamp: new Date(),
      }
    }
  }

  const handleComponentUpdate = async (
    messageId: string,
    data: any,
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    const currentStepIndex = chatContext.data?.stepIndex || 0
    const script = createMatchingScript()
    const currentStep = script.steps[currentStepIndex]
    const stepId = currentStep?.id || ''

    // Validate step data
    if (currentStep?.validation) {
      const validationResult = currentStep.validation(data)
      if (validationResult !== true) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: typeof validationResult === 'string' ? validationResult : 'Dữ liệu không hợp lệ',
          timestamp: new Date(),
        }
      }
    }

    try {
      // Step 1: Method selected
      if (stepId === 'step-1-select-method') {
        return await handleStep1MethodSelected(data, chatContext)
      }

      // Step 2: Method selected
      if (stepId === 'step-2-select-method') {
        return await handleStep2MethodSelected(data, chatContext)
      }

      return null
    } catch (error) {
      console.error('Error handling component update:', error)
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.matching.error', {
          defaultValue: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        }),
        timestamp: new Date(),
      }
    }
  }

  const handleStep1MethodSelected = async (
    data: any,
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    const script = createMatchingScript()
    const method = data.method

    // Store method in context
    chatContext.data = {
      ...chatContext.data,
      jobInputMethod: method,
    }

    if (method === 'prompt') {
      // Move to input step
      const nextStepIndex = 1
      chatContext.data.stepIndex = nextStepIndex
      const nextStep = script.steps[nextStepIndex]
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: nextStep.message,
        timestamp: new Date(),
      }
    } else if (method === 'source') {
      // If items are already selected, process them
      if (data.data?.items && data.data.items.length > 0) {
        return await handleStep1SourceSelected(data.data.items, chatContext)
      }
      // Otherwise, component will show source table
      return null
    } else if (method === 'upload') {
      // If files are already uploaded, process them
      if (data.data?.files && data.data.files.length > 0) {
        return await handleStep1UploadSelected(data.data.files, chatContext)
      }
      // Otherwise, component will show upload handler
      return null
    }

    return null
  }

  const handleStep1SourceSelected = async (
    items: any[],
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    if (items.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Vui lòng chọn ít nhất một job từ database.',
        timestamp: new Date(),
      }
    }

    // Use first selected job
    const selectedJob = items[0]
    state.selectedJob.value = selectedJob

    const script = createMatchingScript()
    const nextStepIndex = 2
    chatContext.data = {
      ...chatContext.data,
      stepIndex: nextStepIndex,
      jobId: selectedJob.id,
    }
    const nextStep = script.steps[nextStepIndex]
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: nextStep.message,
      timestamp: new Date(),
      component: nextStep.component,
    }
  }

  const handleStep1UploadSelected = async (
    files: File[],
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    if (files.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Vui lòng chọn file để upload.',
        timestamp: new Date(),
      }
    }

    // Create job from uploaded file
    const job: Job = {
      title: files[0].name.split('.')[0],
      description: '',
      file: files[0],
      status: 'draft',
    }
    state.selectedJob.value = job

    const script = createMatchingScript()
    const nextStepIndex = 2
    chatContext.data = {
      ...chatContext.data,
      stepIndex: nextStepIndex,
    }
    const nextStep = script.steps[nextStepIndex]
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: nextStep.message,
      timestamp: new Date(),
      component: nextStep.component,
    }
  }

  const handleStep1InputJob = async (
    message: string,
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    const isLink = message.startsWith('http://') || message.startsWith('https://')
    const job = await jobOps.parseJobFromText(message, isLink ? message : undefined)

    if (job) {
      state.selectedJob.value = job
      const script = createMatchingScript()
      const nextStepIndex = 2
      chatContext.data = {
        ...chatContext.data,
        stepIndex: nextStepIndex,
        jobId: job.id,
      }
      const nextStep = script.steps[nextStepIndex]
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: nextStep.message,
        timestamp: new Date(),
        component: nextStep.component,
      }
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: t('chat.matching.step-1.invalid', {
        defaultValue: 'Tôi không thể phân tích thông tin job. Vui lòng thử lại.',
      }),
      timestamp: new Date(),
    }
  }

  const handleStep2MethodSelected = async (
    data: any,
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    const script = createMatchingScript()
    const method = data.method

    chatContext.data = {
      ...chatContext.data,
      candidateInputMethod: method,
    }

    if (method === 'prompt') {
      const nextStepIndex = 3
      chatContext.data.stepIndex = nextStepIndex
      const nextStep = script.steps[nextStepIndex]
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: nextStep.message,
        timestamp: new Date(),
      }
    } else if (method === 'source') {
      // If items are already selected, process them
      if (data.data?.items && data.data.items.length > 0) {
        return await handleStep2SourceSelected(data.data.items, chatContext)
      }
      return null
    } else if (method === 'upload') {
      // If files are already uploaded, process them
      if (data.data?.files && data.data.files.length > 0) {
        return await handleStep2UploadSelected(data.data.files, chatContext)
      }
      return null
    }

    return null
  }

  const handleStep2SourceSelected = async (
    items: any[],
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    if (items.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Vui lòng chọn ít nhất một ứng viên từ database.',
        timestamp: new Date(),
      }
    }

    state.selectedCandidates.value = items

    const script = createMatchingScript()
    const nextStepIndex = 4
    chatContext.data = {
      ...chatContext.data,
      stepIndex: nextStepIndex,
    }
    return await handleStep3('', chatContext)
  }

  const handleStep2UploadSelected = async (
    files: File[],
    chatContext: ChatContext
  ): Promise<ChatMessage | null> => {
    if (files.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Vui lòng chọn file để upload.',
        timestamp: new Date(),
      }
    }

    // Create candidates from uploaded files
    const candidates: Candidate[] = files.map((file) => ({
      firstName: file.name.split('.')[0],
      lastName: '',
      email: '',
      skills: [],
      experience: 0,
      cvFile: file,
    }))
    state.selectedCandidates.value = candidates

    const script = createMatchingScript()
    const nextStepIndex = 4
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
    const candidates = await candidateOps.parseCandidatesFromText(message)

    if (candidates && candidates.length > 0) {
      state.selectedCandidates.value = candidates
      const script = createMatchingScript()
      const nextStepIndex = 4
      chatContext.data = {
        ...chatContext.data,
        stepIndex: nextStepIndex,
      }
      const nextStep = script.steps[nextStepIndex]
      return await handleStep3('', chatContext)
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: t('chat.matching.step-2.invalid', {
        defaultValue: 'Tôi không thể phân tích thông tin ứng viên. Vui lòng thử lại.',
      }),
      timestamp: new Date(),
    }
  }

  const handleStep1 = async (
    message: string,
    chatContext: ChatContext,
    step: any
  ): Promise<ChatMessage | null> => {
    // Check if user wants to select from database
    if (message.toLowerCase().includes('database') || message.toLowerCase().includes('từ database')) {
      const jobs = await jobOps.getJobsFromDatabase()
      if (jobs.length === 0) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: t('chat.matching.step-1.no-jobs', {
            defaultValue: 'Không tìm thấy job nào trong database. Vui lòng cung cấp thông tin job.',
          }),
          timestamp: new Date(),
        }
      }

      // For now, just parse the message as job description
      // In a real implementation, you'd show a list and let user select
      const job = await jobOps.parseJobFromText(message)
      if (job) {
        state.selectedJob.value = job
        chatContext.data = { ...chatContext.data, step: 2 }
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: getStepMessage(2),
          timestamp: new Date(),
        }
      }
    }

    // Try to parse as job description or link
    const isLink = message.startsWith('http://') || message.startsWith('https://')
    const job = await jobOps.parseJobFromText(message, isLink ? message : undefined)

    if (job) {
      state.selectedJob.value = job
      chatContext.data = { ...chatContext.data, step: 2 }
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: getStepMessage(2),
        timestamp: new Date(),
      }
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: t('chat.matching.step-1.invalid', {
        defaultValue: 'Tôi không thể phân tích thông tin job từ tin nhắn của bạn. Vui lòng thử lại với mô tả công việc rõ ràng hơn hoặc link đến job posting.',
      }),
      timestamp: new Date(),
    }
  }

  const handleStep2 = async (
    message: string,
    chatContext: ChatContext,
    step: any
  ): Promise<ChatMessage | null> => {
    // Check if user wants to select from database
    if (message.toLowerCase().includes('database') || message.toLowerCase().includes('từ database')) {
      const candidates = await candidateOps.getCandidatesFromDatabase()
      if (candidates.length === 0) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: t('chat.matching.step-2.no-candidates', {
            defaultValue: 'Không tìm thấy ứng viên nào trong database. Vui lòng cung cấp thông tin ứng viên.',
          }),
          timestamp: new Date(),
        }
      }

      // For now, add all candidates
      // In a real implementation, you'd show a list and let user select
      state.selectedCandidates.value = candidates
      chatContext.data = { ...chatContext.data, step: 3 }
      return await handleStep3(message, chatContext)
    }

    // Parse candidates from text
    const candidates = await candidateOps.parseCandidatesFromText(message)

    if (candidates && candidates.length > 0) {
      state.selectedCandidates.value = candidates
      chatContext.data = { ...chatContext.data, step: 3 }
      return await handleStep3(message, chatContext)
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: t('chat.matching.step-2.invalid', {
        defaultValue: 'Tôi không thể phân tích thông tin ứng viên từ tin nhắn của bạn. Vui lòng thử lại với thông tin ứng viên rõ ràng hơn.',
      }),
      timestamp: new Date(),
    }
  }

  const handleStep3 = async (_message: string, chatContext: ChatContext): Promise<ChatMessage | null> => {
    if (!state.selectedJob.value || state.selectedCandidates.value.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t('chat.matching.step-3.missing-data', {
          defaultValue: 'Thiếu thông tin job hoặc ứng viên. Vui lòng quay lại bước trước.',
        }),
        timestamp: new Date(),
      }
    }

    // Start analysis
    const matchings = await analysisOps.analyzeMatchings(state.selectedJob.value, state.selectedCandidates.value)
    state.matchings.value = matchings

    chatContext.data = { ...chatContext.data, step: 4 }
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: t('chat.matching.step-3.complete', {
        defaultValue: `Đã hoàn thành phân tích! Tìm thấy ${matchings.length} kết quả so khớp.`,
      }),
      timestamp: new Date(),
      metadata: { matchings },
    }
  }

  const handleStep1Component = async (
    data: any,
    chatContext: ChatContext,
    step: any
  ): Promise<ChatMessage | null> => {
    if (data.useDatabase) {
      const jobs = await jobOps.getJobsFromDatabase()
      if (jobs.length === 0) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: t('chat.matching.step-1.no-jobs', {
            defaultValue: 'Không tìm thấy job nào trong database. Vui lòng cung cấp thông tin job.',
          }),
          timestamp: new Date(),
        }
      }

      const script = createMatchingScript()
      const nextStep = script.steps[1]
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: nextStep.message,
        timestamp: new Date(),
        component: {
          type: 'job-selector',
          props: { jobs },
        },
      }
    }

    if (data.jobText) {
      const isLink = data.jobText.startsWith('http://') || data.jobText.startsWith('https://')
      const job = await jobOps.parseJobFromText(data.jobText, isLink ? data.jobText : undefined)

      if (job) {
        state.selectedJob.value = job
        chatContext.data = { ...chatContext.data, step: 2, jobId: job.id }
        const script = createMatchingScript()
        const nextStep = script.steps[1]
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: nextStep.message,
          timestamp: new Date(),
          component: nextStep.component,
        }
      }
    }

    if (data.jobId) {
      const job = await jobOps.getJobById(data.jobId)
      if (job) {
        state.selectedJob.value = job
        chatContext.data = { ...chatContext.data, step: 2, jobId: job.id }
        const script = createMatchingScript()
        const nextStep = script.steps[1]
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: nextStep.message,
          timestamp: new Date(),
          component: nextStep.component,
        }
      }
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: t('chat.matching.step-1.invalid', {
        defaultValue: 'Tôi không thể phân tích thông tin job từ dữ liệu. Vui lòng thử lại.',
      }),
      timestamp: new Date(),
    }
  }

  const handleStep2Component = async (
    data: any,
    chatContext: ChatContext,
    step: any
  ): Promise<ChatMessage | null> => {
    if (data.useDatabase) {
      const candidates = await candidateOps.getCandidatesFromDatabase()
      if (candidates.length === 0) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: t('chat.matching.step-2.no-candidates', {
            defaultValue: 'Không tìm thấy ứng viên nào trong database. Vui lòng cung cấp thông tin ứng viên.',
          }),
          timestamp: new Date(),
        }
      }

      const script = createMatchingScript()
      const nextStep = script.steps[2]
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: nextStep.message,
        timestamp: new Date(),
        component: {
          type: 'candidate-selector',
          props: { candidates },
        },
      }
    }

    if (data.candidateText) {
      const candidates = await candidateOps.parseCandidatesFromText(data.candidateText)
      if (candidates && candidates.length > 0) {
        state.selectedCandidates.value = candidates
        chatContext.data = { ...chatContext.data, step: 3 }
        return await handleStep3('', chatContext)
      }
    }

    if (data.candidateId) {
      const candidate = await candidateOps.getCandidateById(data.candidateId)
      if (candidate) {
        state.selectedCandidates.value = [candidate]
        chatContext.data = { ...chatContext.data, step: 3 }
        return await handleStep3('', chatContext)
      }
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: t('chat.matching.step-2.invalid', {
        defaultValue: 'Tôi không thể phân tích thông tin ứng viên từ dữ liệu. Vui lòng thử lại.',
      }),
      timestamp: new Date(),
    }
  }

  const handleStep4 = async (message: string, _chatContext: ChatContext): Promise<ChatMessage | null> => {
    // Handle actions on results
    if (message.toLowerCase().includes('refresh') || message.toLowerCase().includes('làm mới')) {
      if (state.selectedJob.value && state.selectedCandidates.value.length > 0) {
        const matchings = await analysisOps.analyzeMatchings(state.selectedJob.value, state.selectedCandidates.value)
        state.matchings.value = matchings
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: t('chat.matching.step-4.refreshed', {
            defaultValue: 'Đã làm mới kết quả phân tích.',
          }),
          timestamp: new Date(),
          metadata: { matchings },
        }
      }
    }

    if (message.toLowerCase().includes('reset') || message.toLowerCase().includes('bắt đầu lại')) {
      state.reset()
      _chatContext.data = { step: 1 }
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: getStepMessage(1),
        timestamp: new Date(),
      }
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: t('chat.matching.step-4.help', {
        defaultValue: 'Bạn có thể:\n- Gõ "refresh" để làm mới kết quả\n- Gõ "reset" để bắt đầu lại\n- Xem kết quả chi tiết trong bảng bên dưới',
      }),
      timestamp: new Date(),
    }
  }

  return {
    name: 'matching',
    feature: 'matching',
    handleMessage,
    handleComponentUpdate,
    getInitialMessage,
    getStepMessage,
    canGoBack,
    getTotalSteps,
    getScript,
  }
}

