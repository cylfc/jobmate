// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  extends: [
    "./layers/matching",
    "./layers/candidate",
    "./layers/job",
  ],
  alias: {
    '@matching': fileURLToPath(new URL('./layers/matching', import.meta.url)),
  },
  devtools: { enabled: true },
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxt/hints"
  ],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    openaiApiKey: "",
  },
});
