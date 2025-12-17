import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  alias: {
    '@dashboard': fileURLToPath(new URL('.', import.meta.url)),
  },
})


