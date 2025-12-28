<template>
  <AuthRegisterForm />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: '02-guest',
})
</script>

