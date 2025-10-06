// tailwind.config.js
module.exports = {
	darkMode: 'class', // Already correct ✅
	content: [
		'./src/**/*.{js,ts,jsx,tsx}',
		'./app/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: 'var(--color-primary)',
				'primary-dark': 'var(--color-primary-dark)',
				secondary: 'var(--color-secondary)',
				'secondary-dark': 'var(--color-secondary-dark)',
				accent: 'var(--color-accent)',

				background: 'var(--color-bg)',
				surface: 'var(--color-surface)',
				neutral: 'var(--color-text)',
				muted: 'var(--color-muted)',
				border: 'var(--color-border)',
			},
		},
	},
	plugins: [],
};
