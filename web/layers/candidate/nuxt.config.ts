import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  alias: {
    '@candidate': fileURLToPath(new URL('.', import.meta.url)),
  },
})

