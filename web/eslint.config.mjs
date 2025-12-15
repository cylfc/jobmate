// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    rules: {
      'vue/no-v-model-argument': 'off',
    },
  }
);
// Your custom configs here
