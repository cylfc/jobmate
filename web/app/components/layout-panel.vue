<template>
  <div class="w-full h-full flex flex-col lg:flex-row">
    <UDashboardPanel
      id="layout-panel-left"
      class="flex-none hidden lg:flex"
      :ui="{
        body: 'p-2 sm:p-4',
      }"
      :resizable="true"
      :max-size="45"
      :min-size="0"
    >
      <template #header>
        <slot name="header" />
      </template>
      <template #body>
        <slot name="body" />
      </template>
      <template #footer>
        <slot name="footer" />
      </template>
    </UDashboardPanel>
    <div class="flex-1 bg-bg-200">
      <slot />
    </div>
    <UDrawer id="layout-panel-left" class="lg:hidden">
      <slot name="drawer-trigger">
        <div
          class="flex flex-row justify-center items-center fixed bottom-4 right-0 left-0"
        >
          <UButton
            color="primary"
            variant="subtle"
            trailing-icon="i-lucide-minus"
            class="min-w-16 h-3 flex justify-center items-center shadow text-primary cursor-pointer"
          />
        </div>
      </slot>
      <template #content>
        <div class="p-2">
          <slot name="body" />
        </div>
      </template>
    </UDrawer>
  </div>
</template>
