import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Use the Vercel adapter for deployment
    adapter: adapter(),
    // You can customize paths, prerendering, etc., here if needed
    alias: {
      $lib: 'src/lib',
      $routes: 'src/routes'
    }
  },
  preprocess: vitePreprocess()
};

export default config;
