<template>
  <div class="space-y-4">
    <div v-if="candidateData" class="p-4 border rounded-lg bg-muted space-y-3">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-muted">{{ t('candidate.firstName', { defaultValue: 'Họ' }) }}</label>
          <p class="mt-1">{{ candidateData.firstName }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-muted">{{ t('candidate.lastName', { defaultValue: 'Tên' }) }}</label>
          <p class="mt-1">{{ candidateData.lastName }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-muted">{{ t('candidate.email', { defaultValue: 'Email' }) }}</label>
          <p class="mt-1">{{ candidateData.email }}</p>
        </div>
        <div v-if="candidateData.phone">
          <label class="text-sm font-medium text-muted">{{ t('candidate.phone', { defaultValue: 'Điện thoại' }) }}</label>
          <p class="mt-1">{{ candidateData.phone }}</p>
        </div>
        <div v-if="candidateData.experience !== undefined">
          <label class="text-sm font-medium text-muted">{{ t('candidate.experience', { defaultValue: 'Kinh nghiệm' }) }}</label>
          <p class="mt-1">{{ candidateData.experience }} {{ t('candidate.years', { defaultValue: 'năm' }) }}</p>
        </div>
        <div v-if="candidateData.currentCompany">
          <label class="text-sm font-medium text-muted">{{ t('candidate.currentCompany', { defaultValue: 'Công ty hiện tại' }) }}</label>
          <p class="mt-1">{{ candidateData.currentCompany }}</p>
        </div>
      </div>
      
      <div v-if="candidateData.skills && candidateData.skills.length > 0">
        <label class="text-sm font-medium text-muted">{{ t('candidate.skills', { defaultValue: 'Kỹ năng' }) }}</label>
        <div class="flex flex-wrap gap-2 mt-2">
          <UBadge
            v-for="(skill, index) in candidateData.skills"
            :key="index"
            color="neutral"
            variant="subtle"
            size="md"
          >
            {{ skill }}
          </UBadge>
        </div>
      </div>

      <div v-if="candidateData.expectedSalary" class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-muted">{{ t('candidate.expectedSalary', { defaultValue: 'Mức lương mong muốn' }) }}</label>
          <p class="mt-1">
            {{ candidateData.expectedSalary.min }} - {{ candidateData.expectedSalary.max }} {{ candidateData.expectedSalary.currency }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex gap-2 justify-end">
      <UButton
        color="neutral"
        variant="outline"
        @click="handleEdit"
      >
        {{ t('chat.create-candidate.review.edit', { defaultValue: 'Chỉnh sửa' }) }}
      </UButton>
      <UButton
        color="primary"
        @click="handleConfirm"
      >
        {{ t('chat.create-candidate.review.confirm', { defaultValue: 'Xác nhận và tạo' }) }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateCandidateInput } from '@candidate/types/candidate'

interface Props {
  candidateData?: CreateCandidateInput
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update', data: any): void
}>()

const { t } = useI18n()

const handleEdit = () => {
  // Emit update to go back to input step
  if (props.candidateData) {
    emit('update', { 
      candidateData: props.candidateData,
      action: 'edit'
    })
  }
}

const handleConfirm = () => {
  // Emit confirm action
  emit('update', { 
    action: 'confirm'
  })
}
</script>

