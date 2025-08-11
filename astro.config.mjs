import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
build: {
    assets: 'assets'
  },
export default defineConfig({
  site: 'https://almacaribe.co'
  integrations: [tailwind(), react()],
});
