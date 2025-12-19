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

  const handleMessage = async (message: string, chatContext: ChatContext): Promise<ChatMessage | null> => {
    const currentStep = chatContext.data?.step || 1

    try {
      switch (currentStep) {
        case 1:
          return await handleStep1(message, chatContext)
        case 2:
          return await handleStep2(message, chatContext)
        case 3:
          return await handleStep3(message, chatContext)
        case 4:
          return await handleStep4(message, chatContext)
        default:
          return null
      }
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

  const handleStep1 = async (message: string, chatContext: ChatContext): Promise<ChatMessage | null> => {
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

  const handleStep2 = async (message: string, chatContext: ChatContext): Promise<ChatMessage | null> => {
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
    getInitialMessage,
    getStepMessage,
    canGoBack,
    getTotalSteps,
  }
}

