// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    "./layers/matching",
    "./layers/candidate",
    "./layers/job",
  ],
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
