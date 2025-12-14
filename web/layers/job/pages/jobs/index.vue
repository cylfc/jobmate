<template>
  <div>
    <h1>{{ t('job.title') }}</h1>
    <UButton color="primary">{{ t('job.layer') }}</UButton>
    <JobCard />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'default',
})
</script>

