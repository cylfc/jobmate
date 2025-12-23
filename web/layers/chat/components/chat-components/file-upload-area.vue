<template>
  <div class="space-y-4">
    <!-- File upload area -->
    <div class="flex flex-wrap gap-3">
      <!-- Upload dash card -->
      <div
        class="relative flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-muted rounded-lg cursor-pointer transition-colors hover:border-primary hover:bg-muted/50 group"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          :accept="accept"
          :multiple="multiple"
          class="hidden"
          @change="handleFileChange"
        />
        <UIcon
          name="i-lucide-plus"
          class="w-8 h-8 text-muted group-hover:text-primary transition-colors"
        />
        <span class="text-xs text-muted mt-1 group-hover:text-primary transition-colors">
          Upload
        </span>
      </div>

      <!-- File cards -->
      <div
        v-for="(file, index) in files"
        :key="`file-${index}-${file.name}`"
        class="relative flex flex-col items-center justify-center w-32 h-32 border border-muted rounded-lg bg-muted/30 p-2 group"
      >
        <UIcon name="i-lucide-file" class="w-6 h-6 text-muted mb-1" />
        <span
          class="text-xs text-center text-default font-medium truncate w-full"
          :title="file.name"
        >
          {{ file.name }}
        </span>
        <span class="text-xs text-muted mt-1">
          {{ formatFileSize(file.size) }}
        </span>
        <UButton
          color="red"
          variant="ghost"
          size="xs"
          icon="i-lucide-x"
          class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="removeFile(index)"
        />
      </div>
    </div>

    <!-- Hint text -->
    <p v-if="hint" class="text-xs text-muted">
      {{ hint }}
    </p>
    <p v-else class="text-xs text-muted">
      Chấp nhận các định dạng: {{ accept }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  accept?: string
  multiple?: boolean
  hint?: string
  modelValue?: File[]
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.pdf,.doc,.docx,.txt',
  multiple: false,
  hint: undefined,
  modelValue: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', files: File[]): void
  (e: 'update', data: { files: File[] }): void
}>()

const fileInputRef = ref<HTMLInputElement>()
const files = ref<File[]>(props.modelValue || [])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newFiles) => {
  if (newFiles) {
    files.value = [...newFiles]
  }
}, { deep: true })

// Emit updates when files change
watch(files, (newFiles) => {
  emit('update:modelValue', newFiles)
  emit('update', { files: newFiles })
}, { deep: true })

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    if (props.multiple) {
      // Add new files to existing ones
      const newFiles = Array.from(target.files)
      files.value = [...files.value, ...newFiles]
    } else {
      // Replace with single file
      files.value = [target.files[0]]
    }
    // Reset input to allow selecting the same file again
    target.value = ''
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Expose methods for parent components
defineExpose({
  clearFiles: () => {
    files.value = []
  },
  getFiles: () => files.value,
})
</script>

