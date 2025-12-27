import type { ChatScript } from '@chat/types/script'
import type { ChatMessage } from '@chat/types/chat'
import { createMatchingSteps } from './matching-steps'

export const createMatchingScript = (t?: (key: string, options?: any) => string): ChatScript => {
  const getT = (key: string, defaultValue: string) => {
    return t ? t(key, { defaultValue }) : defaultValue
  }

  return {
    id: 'matching',
    name: 'Job Matching',
    feature: 'matching',
    steps: createMatchingSteps(getT),
    onStart: async (context: any) => {
      context.step = 0
    },
    onComplete: async (context: any) => {
      // Finalize matching process
    },
  }
}

