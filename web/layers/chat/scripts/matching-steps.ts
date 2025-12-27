/**
 * Matching Script Steps
 * Defines all steps for the matching chat script
 * Separated from script factory for easier extension
 */
import type { ScriptStep } from '@chat/types/script'

export const createMatchingSteps = (getT: (key: string, defaultValue: string) => string): ScriptStep[] => {
  return [
    {
      id: 'step-1-select-method',
      name: 'Select Job Input Method',
      message: getT('chat.matching.step-1.message', 'Hãy nhập chi tiết JD'),
      component: {
        type: 'input-method-selector',
        props: {
          type: 'job',
          methods: [
            { value: 'source', label: getT('chat.components.input-method.methods.database', 'Chọn từ database'), icon: 'i-lucide-database' },
            { value: 'upload', label: getT('chat.components.input-method.methods.upload-file', 'Upload file'), icon: 'i-lucide-file-up' },
          ],
          // Matching candidate with job: can select multiple JDs
          multiple: true,
          accept: '.pdf,.doc,.docx,.txt',
        },
      },
      validation: (data: any) => {
        // Method is optional now - user can type directly or select from options
        return true
      },
    },
    {
      id: 'step-1-input-job',
      name: 'Input Job Data',
      message: getT('chat.matching.step-1.input-message', 'Vui lòng nhập thông tin công việc vào ô chat phía dưới:'),
      validation: (data: any) => {
        if (!data.jobText && !data.jobId && !data.files) {
          return getT('chat.matching.step-1.input-required', 'Vui lòng cung cấp thông tin công việc')
        }
        return true
      },
    },
    {
      id: 'step-2-select-method',
      name: 'Select Candidate Input Method',
      message: getT('chat.matching.step-2.message', 'Hãy nhập thông tin ứng viên'),
      component: {
        type: 'input-method-selector',
        props: {
          type: 'candidate',
          methods: [
            { value: 'source', label: getT('chat.components.input-method.methods.database', 'Chọn từ database'), icon: 'i-lucide-database' },
            { value: 'upload', label: getT('chat.components.input-method.methods.upload-cv', 'Upload CV'), icon: 'i-lucide-file-up' },
          ],
          // Matching job with candidate: can select multiple CVs, but only 1 JD
          // Note: For matching candidate with job scenario, only 1 candidate is allowed
          multiple: true,
          accept: '.pdf,.doc,.docx,.txt',
        },
      },
      validation: (data: any) => {
        // Method is optional now - user can type directly or select from options
        return true
      },
    },
    {
      id: 'step-2-input-candidate',
      name: 'Input Candidate Data',
      message: getT('chat.matching.step-2.input-message', 'Vui lòng nhập thông tin ứng viên vào ô chat phía dưới:'),
      validation: (data: any) => {
        if (!data.candidateText && !data.candidateIds && !data.files) {
          return getT('chat.matching.step-2.input-required', 'Vui lòng cung cấp thông tin ứng viên')
        }
        return true
      },
    },
    {
      id: 'step-3',
      name: 'Analysis',
      message: getT('chat.matching.step-3.prompt', 'Đang phân tích và so khớp...'),
    },
    {
      id: 'step-4',
      name: 'Results',
      message: getT('chat.matching.step-4.prompt', 'Đã hoàn thành phân tích! Đây là kết quả so khớp.'),
    },
  ]
}

