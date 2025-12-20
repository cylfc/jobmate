import type { Component } from 'vue'

export type ComponentType = string

export interface ComponentConfig {
  type: ComponentType
  props?: Record<string, any>
  events?: Record<string, (...args: any[]) => void>
}

export interface ScriptStep {
  id: string
  name: string
  message: string
  component?: ComponentConfig
  validation?: (data: any) => boolean | string
  onComplete?: (data: any, context: any) => void | Promise<void>
}

export interface ChatScript {
  id: string
  name: string
  feature: string
  steps: ScriptStep[]
  onStart?: (context: any) => void | Promise<void>
  onComplete?: (context: any) => void | Promise<void>
}

export interface ScriptContext {
  scriptId: string
  currentStep: number
  data: Record<string, any>
  completedSteps: string[]
}

