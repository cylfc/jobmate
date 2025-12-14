import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  // Auth layer configuration
  alias: {
    '@auth': fileURLToPath(new URL('.', import.meta.url)),
  },
})

