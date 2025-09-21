<template>
  <div class="flex flex-col justify-start items-stretch gap-6">
    <template v-for="i in 5" :key="i">
      <div class="flex justify-start items-center gap-4">
        <USkeleton class="h-12 w-12 rounded-full" />
        <div class="flex-grow flex flex-col justify-center items-start gap-2">
          <USkeleton class="h-4 w-4/5" />
          <USkeleton class="h-4 w-2/5" />
        </div>
      </div>
      <div class="flex justify-end items-center gap-4">
        <div class="flex-grow flex flex-col justify-center items-end gap-2">
          <USkeleton class="h-4 w-4/5" />
          <USkeleton class="h-4 w-3/5" />
        </div>
        <USkeleton class="h-12 w-12 rounded-full" />
      </div>
    </template>
  </div>
</template>
