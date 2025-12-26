import type { ChatScript } from '@chat/types/script'

export const createCreateCandidateScript = (t?: (key: string, options?: any) => string): ChatScript => {
  const getT = (key: string, defaultValue: string) => {
    return t ? t(key, { defaultValue }) : defaultValue
  }

  return {
    id: 'create-candidate',
    name: 'Create Candidate',
    feature: 'create-candidate',
    steps: [
      {
        id: 'step-1-select-method',
        name: 'Select Input Method',
        message: getT('chat.create-candidate.step-1.message', 'Hãy chọn phương thức nhập thông tin ứng viên'),
        component: {
          type: 'input-method-selector',
          props: {
            type: 'candidate',
            methods: [
              { value: 'upload', label: getT('chat.components.input-method.methods.upload-cv', 'Upload CV'), icon: 'i-lucide-file-up' },
            ],
            multiple: false,
            accept: '.pdf,.doc,.docx,.txt',
          },
        },
        validation: (data: any) => {
          // Method is optional - user can type directly or select from options
          return true
        },
      },
      {
        id: 'step-2-input-candidate',
        name: 'Input Candidate Data',
        message: getT('chat.create-candidate.step-2.input-message', 'Vui lòng nhập thông tin ứng viên vào ô chat phía dưới hoặc upload CV:'),
        validation: (data: any) => {
          if (!data.candidateText && !data.files) {
            return getT('chat.create-candidate.step-2.input-required', 'Vui lòng cung cấp thông tin ứng viên hoặc upload CV')
          }
          return true
        },
      },
      {
        id: 'step-3-parse-review',
        name: 'Parse & Review',
        message: getT('chat.create-candidate.step-3.prompt', 'Đang phân tích thông tin ứng viên...'),
      },
      {
        id: 'step-4-confirm-save',
        name: 'Confirm & Save',
        message: getT('chat.create-candidate.step-4.prompt', 'Xác nhận và lưu thông tin ứng viên?'),
      },
    ],
    onStart: async (context: any) => {
      context.step = 0
    },
    onComplete: async (context: any) => {
      // Finalize create candidate process
    },
  }
}

