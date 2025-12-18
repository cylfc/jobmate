// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    rules: {
      'vue/no-v-model-argument': 'off',
    },
    overrides: [
      {
        files: ['**/notification-drawer.vue'],
        rules: {
          'vue/no-multiple-template-root': 'off',
        },
      },
    ],
  }
);
// Your custom configs here
