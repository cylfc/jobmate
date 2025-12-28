<template>
  <AuthChangePasswordForm />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: '01-auth',
})
</script>

