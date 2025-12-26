import { registerChatComponent } from '@chat/stores/component-registry'
import ChatJobSelector from '@chat/components/chat-components/job-selector.vue'
import ChatCandidateSelector from '@chat/components/chat-components/candidate-selector.vue'
import ChatJobInput from '@chat/components/chat-components/job-input.vue'
import ChatCandidateInput from '@chat/components/chat-components/candidate-input.vue'
import ChatInputMethodSelector from '@chat/components/chat-components/input-method-selector.vue'
import ChatSourceTable from '@chat/components/chat-components/source-table.vue'
import ChatUploadHandler from '@chat/components/chat-components/upload-handler.vue'
import ChatCandidateFormPreview from '@chat/components/chat-components/candidate-form-preview.vue'

export const useChatComponents = () => {
  const registerDefaultComponents = () => {
    registerChatComponent('job-selector', ChatJobSelector)
    registerChatComponent('candidate-selector', ChatCandidateSelector)
    registerChatComponent('job-input', ChatJobInput)
    registerChatComponent('candidate-input', ChatCandidateInput)
    registerChatComponent('input-method-selector', ChatInputMethodSelector)
    registerChatComponent('source-table', ChatSourceTable)
    registerChatComponent('upload-handler', ChatUploadHandler)
    registerChatComponent('candidate-form-preview', ChatCandidateFormPreview)
  }

  return {
    registerDefaultComponents,
  }
}

