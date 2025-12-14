<template>
  <aside class="w-64 border-r border-gray-200 bg-white h-[calc(100vh-4rem)] overflow-y-auto">
    <nav class="p-4 space-y-1">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="isActive(item.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
      >
        <UIcon :name="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
interface MenuItem {
  label: string
  icon: string
  to: string
}

const route = useRoute()

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/dashboard',
  },
  {
    label: 'Matching',
    icon: 'i-lucide-users',
    to: '/matching',
  },
  {
    label: 'Việc làm',
    icon: 'i-lucide-briefcase',
    to: '/jobs',
  },
  {
    label: 'Ứng viên',
    icon: 'i-lucide-user-circle',
    to: '/candidates',
  },
]

const isActive = (path: string) => {
  return route.path.startsWith(path)
}
</script>

