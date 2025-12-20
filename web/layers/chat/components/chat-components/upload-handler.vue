<template>
  <div class="space-y-4">
    <UFormField :label="label">
      <UInput
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="w-full"
        @change="handleFileChange"
      />
      <template #hint>
        <p class="text-sm text-muted mt-1">
          {{ hint || `Chấp nhận các định dạng: ${accept}` }}
        </p>
      </template>
    </UFormField>

    <div v-if="files.length > 0" class="space-y-2">
      <p class="text-sm font-medium">Files đã chọn:</p>
      <div class="space-y-2">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center justify-between p-3 bg-muted rounded-lg"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file" class="w-5 h-5 text-muted" />
            <span class="text-sm">{{ file.name }}</span>
            <span class="text-xs text-muted">({{ formatFileSize(file.size) }})</span>
          </div>
          <UButton
            color="red"
            variant="ghost"
            size="xs"
            icon="i-lucide-trash"
            @click="removeFile(index)"
          />
        </div>
      </div>
    </div>

    <UButton
      v-if="files.length > 0"
      color="primary"
      block
      @click="handleConfirm"
    >
      Xác nhận ({{ files.length }} file{{ files.length > 1 ? 's' : '' }})
    </UButton>
  </div>
</template>

<script setup lang="ts">
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

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    if (props.multiple) {
      files.value = Array.from(target.files)
    } else {
      files.value = target.files[0] ? [target.files[0]] : []
    }
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleConfirm = () => {
  emit('update', { files: files.value })
}
</script>

