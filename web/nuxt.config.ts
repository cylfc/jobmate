// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  extends: [
    "./layers/matching",
    "./layers/candidate",
    "./layers/job",
    "./layers/auth",
    "./layers/setting",
  ],
  alias: {
    '@matching': fileURLToPath(new URL('./layers/matching', import.meta.url)),
    '@auth': fileURLToPath(new URL('./layers/auth', import.meta.url)),
    '@candidate': fileURLToPath(new URL('./layers/candidate', import.meta.url)),
    '@job': fileURLToPath(new URL('./layers/job', import.meta.url)),
    '@setting': fileURLToPath(new URL('./layers/setting', import.meta.url)),
  },
  devtools: { enabled: true },
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxt/hints",
    "@nuxtjs/i18n"
  ],
  i18n: {
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'vi',
    locales: [
      { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    openaiApiKey: "",
  },
});
