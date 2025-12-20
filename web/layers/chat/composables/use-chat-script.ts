import type { ChatScript, ScriptStep, ScriptContext } from '@chat/types/script'
import type { ChatMessage, ChatContext } from '@chat/types/chat'

export interface ScriptHandler {
  getScript(): ChatScript
  getCurrentStep(context: ScriptContext): ScriptStep | null
  validateStep(step: ScriptStep, data: any): boolean | string
  executeStep(step: ScriptStep, data: any, context: ScriptContext): Promise<ChatMessage | null>
  canProceed(context: ScriptContext): boolean
  canGoBack(context: ScriptContext): boolean
}

export const useChatScript = (handler: ScriptHandler) => {
  const script = handler.getScript()

  const getCurrentStep = (context: ScriptContext): ScriptStep | null => {
    return handler.getCurrentStep(context)
  }

  const validateStep = (step: ScriptStep, data: any): boolean | string => {
    return handler.validateStep(step, data)
  }

  const executeStep = async (
    step: ScriptStep,
    data: any,
    context: ScriptContext
  ): Promise<ChatMessage | null> => {
    return handler.executeStep(step, data, context)
  }

  const canProceed = (context: ScriptContext): boolean => {
    return handler.canProceed(context)
  }

  const canGoBack = (context: ScriptContext): boolean => {
    return handler.canGoBack(context)
  }

  const getNextStep = (context: ScriptContext): ScriptStep | null => {
    if (context.currentStep >= script.steps.length - 1) {
      return null
    }
    return script.steps[context.currentStep + 1] || null
  }

  const getPreviousStep = (context: ScriptContext): ScriptStep | null => {
    if (context.currentStep <= 0) {
      return null
    }
    return script.steps[context.currentStep - 1] || null
  }

  const goToStep = (stepIndex: number, context: ScriptContext): ScriptContext => {
    return {
      ...context,
      currentStep: stepIndex,
    }
  }

  const completeStep = (stepId: string, data: any, context: ScriptContext): ScriptContext => {
    return {
      ...context,
      data: {
        ...context.data,
        [stepId]: data,
      },
      completedSteps: [...context.completedSteps, stepId],
    }
  }

  return {
    script,
    getCurrentStep,
    validateStep,
    executeStep,
    canProceed,
    canGoBack,
    getNextStep,
    getPreviousStep,
    goToStep,
    completeStep,
  }
}

