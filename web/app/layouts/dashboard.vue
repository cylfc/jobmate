<template>
  <div class="min-h-screen flex flex-col bg-muted dark:bg-default">
    <LayoutsDashboardHeader />
    <UDashboardGroup storage-key="dashboard-sidebar">
      <UDashboardSidebar
        resizable
        collapsible
        :default-size="20"
        :min-size="16"
        :max-size="30"
        :collapsed-size="0"
        class="bg-default"
      >
        <template #header="{ collapsed }">
          <LayoutsDashboardSidebar :collapsed="collapsed" type="header" />
        </template>

        <template #default="{ collapsed }">
          <LayoutsDashboardSidebar :collapsed="collapsed" type="content" />
        </template>
      </UDashboardSidebar>

      <UDashboardPanel>
        <template #header>
          <div class="h-16" />
        </template>
        <main class="flex-1 overflow-y-auto flex flex-col justify-start items-stretch">
          <div class="p-4 mt-16 flex-1">
            <slot />
          </div>
        </main>
      </UDashboardPanel>
    </UDashboardGroup>

    <!-- Chat Modal (shown when not on chat page) -->
    <ChatModal />
  </div>
</template>

<script setup lang="ts">
import { initChatSetup, useChatSetup } from '@chat/composables/use-chat-setup'
import { useChatHandlers } from '@chat/composables/use-chat-handlers'

const route = useRoute()
const { setDisplayMode } = useChatSetup()

// Initialize chat handlers (automatically registers matching factory)
useChatHandlers()

initChatSetup({
  status: 'ready',
  shouldAutoScroll: true,
  shouldScrollToBottom: true,
  autoScroll: true,
  compact: false,
  spacingOffset: 0,
  displayMode: 'modal',
  selectedPurpose: 'matching',
})

watch(() => route.path, (path) => {
  if (path === '/chat') {
    setDisplayMode('inline')
  } else {
    setDisplayMode('modal')
  }
}, { immediate: true })
</script>
