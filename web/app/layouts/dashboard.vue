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
          <div class="p-6 mt-16 flex-1">
            <slot />
          </div>
        </main>
      </UDashboardPanel>
    </UDashboardGroup>

    <!-- Chat Floating Button -->
    <ChatFloatingButton />

    <!-- Chat Modal (shown when not on chat page) -->
    <ChatModal />
  </div>
</template>

<script setup lang="ts">
// Dashboard layout for authenticated pages

</script>
