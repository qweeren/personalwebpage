import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Force edge deployment
			edge: false,
			// Split code into smaller chunks
			split: false
		})
	}
};

export default config;