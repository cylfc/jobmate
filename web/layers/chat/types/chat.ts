export type ChatMessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  timestamp: Date
  metadata?: Record<string, any>
  component?: {
    type: string
    props?: Record<string, any>
  }
}

export type ChatFeature = 'matching' | 'create-candidate' | 'create-job' | 'create-company' | 'general'

export interface ChatContext {
  feature: ChatFeature
  data?: Record<string, any>
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  context: ChatContext | null
}

export interface ChatHandler {
  name: string
  feature: ChatFeature
  handleMessage: (message: string, context: ChatContext) => Promise<ChatMessage | null>
  handleComponentUpdate?: (messageId: string, data: any, context: ChatContext) => Promise<ChatMessage | null>
  getInitialMessage: () => string
  getStepMessage: (step: number) => string
  canGoBack: (currentStep: number) => boolean
  getTotalSteps: () => number
}

