<template>
  <div class="space-y-4">
    <FileUploadArea
      :accept="accept"
      :multiple="multiple"
      :hint="hint"
      :model-value="files"
      @update:model-value="handleFilesUpdate"
      @update="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import FileUploadArea from './file-upload-area.vue'

interface Props {
  accept?: string
  multiple?: boolean
  label?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.pdf,.doc,.docx,.txt',
  multiple: false,
  label: 'Chọn file để upload',
  hint: undefined,
})

const emit = defineEmits<{
  (e: 'update', data: { files: File[] }): void
}>()

const files = ref<File[]>([])

const handleFilesUpdate = (newFiles: File[]) => {
  files.value = newFiles
}

const handleUpdate = (data: { files: File[] }) => {
  emit('update', data)
}
</script>

