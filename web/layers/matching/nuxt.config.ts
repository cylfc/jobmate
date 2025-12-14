import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  // Matching layer configuration
  alias: {
    '@matching': fileURLToPath(new URL('.', import.meta.url)),
  },
})

