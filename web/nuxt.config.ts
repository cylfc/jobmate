// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  extends: [
    "./layers/matching",
    "./layers/candidate",
    "./layers/job",
    "./layers/auth",
    "./layers/setting",
    "./layers/dashboard",
    "./layers/chat",
  ],
  alias: {
    '@matching': fileURLToPath(new URL('./layers/matching', import.meta.url)),
    '@auth': fileURLToPath(new URL('./layers/auth', import.meta.url)),
    '@candidate': fileURLToPath(new URL('./layers/candidate', import.meta.url)),
    '@job': fileURLToPath(new URL('./layers/job', import.meta.url)),
    '@setting': fileURLToPath(new URL('./layers/setting', import.meta.url)),
    '@dashboard': fileURLToPath(new URL('./layers/dashboard', import.meta.url)),
    '@chat': fileURLToPath(new URL('./layers/chat', import.meta.url)),
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
    "@nuxtjs/i18n",
    'nuxt-echarts',
  ],
  echarts: {
    charts: ['BarChart', 'LineChart', 'PieChart'],
    components: ['GridComponent', 'TooltipComponent', 'LegendComponent'],
    renderer: ['svg', 'canvas']
  },
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
    /**
     * AI SDK (server-only)
     * - Set via env: NUXT_OPENAI_API_KEY=...
     */
    openaiApiKey: "",
    /**
     * Optional: Vercel AI Gateway (recommended by AI SDK Nuxt quickstart)
     * - Set via env: NUXT_AI_GATEWAY_API_KEY=...
     * See: https://ai-sdk.dev/docs/getting-started/nuxt
     */
    aiGatewayApiKey: "",
  },
});