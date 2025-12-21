import type { ChatScript, ScriptStep } from '@chat/types/script'
import type { ChatMessage } from '@chat/types/chat'

export const createMatchingScript = (): ChatScript => {
  return {
    id: 'matching',
    name: 'Job Matching',
    feature: 'matching',
    steps: [
      {
        id: 'step-1-select-method',
        name: 'Select Job Input Method',
        message: 'Chọn cách bạn muốn cung cấp thông tin về công việc:',
        component: {
          type: 'input-method-selector',
          props: {
            type: 'job',
            methods: [
              { value: 'prompt', label: 'Nhập text', icon: 'i-lucide-pencil' },
              { value: 'source', label: 'Chọn từ database', icon: 'i-lucide-database' },
              { value: 'upload', label: 'Upload file', icon: 'i-lucide-file-up' },
            ],
          },
        },
        validation: (data: any) => {
          if (!data.method) {
            return 'Vui lòng chọn phương thức nhập liệu'
          }
          return true
        },
      },
      {
        id: 'step-1-input-job',
        name: 'Input Job Data',
        message: 'Vui lòng nhập thông tin công việc vào ô chat phía dưới:',
        validation: (data: any) => {
          if (!data.jobText && !data.jobId && !data.files) {
            return 'Vui lòng cung cấp thông tin công việc'
          }
          return true
        },
      },
      {
        id: 'step-2-select-method',
        name: 'Select Candidate Input Method',
        message: 'Chọn cách bạn muốn cung cấp thông tin về ứng viên:',
        component: {
          type: 'input-method-selector',
          props: {
            type: 'candidate',
            methods: [
              { value: 'prompt', label: 'Nhập text', icon: 'i-lucide-pencil' },
              { value: 'source', label: 'Chọn từ database', icon: 'i-lucide-database' },
              { value: 'upload', label: 'Upload CV', icon: 'i-lucide-file-up' },
            ],
            multiple: true,
          },
        },
        validation: (data: any) => {
          if (!data.method) {
            return 'Vui lòng chọn phương thức nhập liệu'
          }
          return true
        },
      },
      {
        id: 'step-2-input-candidate',
        name: 'Input Candidate Data',
        message: 'Vui lòng nhập thông tin ứng viên vào ô chat phía dưới:',
        validation: (data: any) => {
          if (!data.candidateText && !data.candidateIds && !data.files) {
            return 'Vui lòng cung cấp thông tin ứng viên'
          }
          return true
        },
      },
      {
        id: 'step-3',
        name: 'Analysis',
        message: 'Đang phân tích và so khớp...',
      },
      {
        id: 'step-4',
        name: 'Results',
        message: 'Đã hoàn thành phân tích! Đây là kết quả so khớp.',
      },
    ],
    onStart: async (context: any) => {
      context.step = 0
    },
    onComplete: async (context: any) => {
      // Finalize matching process
    },
  }
}

