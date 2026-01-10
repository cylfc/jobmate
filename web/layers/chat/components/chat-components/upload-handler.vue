<template>
  <div class="space-y-4">
    <FileUploadArea
      v-model="files"
      :accept="accept"
      :multiple="multiple"
      :hint="hint"
      @update="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import FileUploadArea from "./file-upload-area.vue";

interface Props {
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
}

withDefaults(defineProps<Props>(), {
  accept: ".pdf,.doc,.docx,.txt",
  multiple: false,
  label: undefined,
  hint: undefined,
});

const emit = defineEmits<{
  (e: "update", data: { files: File[] }): void;
}>();

const files = ref<File[]>([]);

const handleUpdate = (data: { files: File[] }) => {
  emit("update", data);
};
</script>
