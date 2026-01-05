export default defineAppConfig({
  ui: {
    colors: {
      primary: "brand",
      neutral: "slate",
    },
    button: {
      variants: {
        color: {
          'primary': "border-primary-600 ring-primary-500"
        },
        variant: {
          'solid': "border-b-2 ring"
        }
      }
    }
  },
});
