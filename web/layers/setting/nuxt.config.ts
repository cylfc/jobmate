import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  alias: {
    '@setting': fileURLToPath(new URL('.', import.meta.url)),
  },
})


