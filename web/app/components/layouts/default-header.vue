<template>
  <header class="border-b border-gray-200 bg-white">
    <UContainer>
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="flex items-center gap-2">
            <UIcon name="i-lucide-briefcase" class="w-8 h-8 text-primary-600" />
            <span class="text-xl font-bold text-gray-900">JobMate</span>
          </NuxtLink>
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink to="/" class="text-sm font-medium text-gray-700 hover:text-primary-600">
              Trang chủ
            </NuxtLink>
            <NuxtLink to="/jobs" class="text-sm font-medium text-gray-700 hover:text-primary-600">
              Việc làm
            </NuxtLink>
            <NuxtLink to="/candidates" class="text-sm font-medium text-gray-700 hover:text-primary-600">
              Ứng viên
            </NuxtLink>
            <NuxtLink to="/matching" class="text-sm font-medium text-gray-700 hover:text-primary-600">
              Matching
            </NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <UButton to="/auth/login" color="neutral" variant="ghost" size="sm">
            Đăng nhập
          </UButton>
          <UButton to="/auth/register" color="primary" size="sm">
            Đăng ký
          </UButton>
        </div>
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
// Default header for landing page
</script>

