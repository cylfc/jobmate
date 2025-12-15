import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  alias: {
    '@job': fileURLToPath(new URL('.', import.meta.url)),
  },
})

