export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  component?: {
    type: string;
    props?: Record<string, unknown>;
  };
}

export type ChatFeature =
  | "matching"
  | "create-candidate"
  | "create-job"
  | "create-company"
  | "general";

export interface ChatContext {
  feature: ChatFeature;
  data?: Record<string, unknown>;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  context: ChatContext | null;
}

export interface ChatHandler {
  name: string;
  feature: ChatFeature;
  handleMessage: (
    message: string,
    context: ChatContext,
  ) => Promise<ChatMessage | null>;
  handleComponentUpdate?: (
    messageId: string,
    data: unknown,
    context: ChatContext,
  ) => Promise<ChatMessage | null>;
  getInitialMessage: () => string;
  getStepMessage: (step: number) => string;
  canGoBack: (currentStep: number) => boolean;
  getTotalSteps: () => number;
}
