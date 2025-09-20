<template>
  <div class="w-full h-full flex flex-1">
    <UDashboardPanel id="layout-panel-left" class="flex-none" :resizable="true" :max-size="45" :min-size="0">
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
  </div>
</template>
