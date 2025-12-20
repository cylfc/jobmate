<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

interface Props {
  collapsed?: boolean
  type?: 'header' | 'content'
}

withDefaults(defineProps<Props>(), {
  collapsed: false,
  type: 'content',
})

const { t } = useI18n()
const route = useRoute()

const menuItems = computed<NavigationMenuItem[]>(() => [
  {
    label: t('nav.dashboard'),
    icon: 'i-lucide-layout-dashboard',
    to: '/dashboard',
    active: route.path === '/dashboard',
  },
  {
    label: t('nav.matching'),
    icon: 'i-lucide-users',
    to: '/matching',
    active: route.path.startsWith('/matching'),
  },
  {
    label: t('nav.jobs'),
    icon: 'i-lucide-briefcase',
    to: '/jobs',
    active: route.path.startsWith('/jobs'),
  },
  {
    label: t('nav.candidates'),
    icon: 'i-lucide-user-circle',
    to: '/candidates',
    active: route.path.startsWith('/candidates'),
  },
  {
    label: t('nav.chat'),
    icon: 'i-lucide-message-circle',
    to: '/chat?feature=matching',
    active: route.path.startsWith('/chat'),
  },
])
</script>

<template>
  <!-- Header content -->
  <div v-if="type === 'header'">
    <div v-if="!collapsed" class="flex items-center gap-2 px-4">
              <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-primary" />
      <span class="text-lg font-bold text-default">JobMate</span>
    </div>
    <div v-else class="flex items-center justify-center">
              <UIcon name="i-lucide-briefcase" class="w-5 h-5 text-primary" />
    </div>
  </div>

  <!-- Content -->
  <div v-else>
    <UNavigationMenu
      :collapsed="collapsed"
      :items="menuItems"
      orientation="vertical"
      :ui="{
        link: 'py-2'
      }"
    />
  </div>
</template>
