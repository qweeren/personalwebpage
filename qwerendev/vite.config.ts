import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { photos } from './scripts/photos.js';

export default defineConfig({
	plugins: [photos(), sveltekit()]
});
