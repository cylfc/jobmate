<template>
  <div>
    <div class="relative min-w-2xl">
      <u-textarea
        :ui="{
          base: 'ring-primary rounded-xl outline-none ring-1 p-4 text-base',
        }"
        class="w-full"
        placeholder="Tell something..."
      />
      <u-button variant="solid" class="absolute bottom-4 right-4 rounded-full h-10 w-10 text-center justify-center items-center" size="xl"
        >
        <u-icon name="i-lucide-sparkles" />
        </u-button
      >
    </div>
  </div>
</template>
