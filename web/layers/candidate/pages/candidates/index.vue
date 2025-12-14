<template>
  <div>
    <h1>{{ t('candidate.title') }}</h1>
    <UButton color="primary">{{ t('candidate.layer') }}</UButton>
    <CandidateCard />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'default',
})
</script>

