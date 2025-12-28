<template>
  <header class="border-b border-default bg-default">
    <UContainer>
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-8">
          <TheLogo to="/" />
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink to="/" class="text-sm font-medium text-toned hover:text-primary">
              {{ t('nav.home') }}
            </NuxtLink>
            <NuxtLink to="/jobs" class="text-sm font-medium text-toned hover:text-primary">
              {{ t('nav.jobs') }}
            </NuxtLink>
            <NuxtLink to="/candidates" class="text-sm font-medium text-toned hover:text-primary">
              {{ t('nav.candidates') }}
            </NuxtLink>
            <NuxtLink to="/matching" class="text-sm font-medium text-toned hover:text-primary">
              {{ t('nav.matching') }}
            </NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <UButton to="/auth/login" color="neutral" variant="ghost" size="sm">
            {{ t('auth.login') }}
          </UButton>
          <UButton to="/auth/register" color="primary" size="sm">
            {{ t('auth.register') }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

