import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // semantic tokens mapped to CSS variables populated from docs/design-tokens.json at runtime
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        brand: 'var(--brand)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        info: 'var(--info)',
          ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius-lg, 12px)',
        md: 'var(--radius-md, 10px)',
          sm: 'var(--radius-sm, 8px)',
      },
    },
  },
    plugins: [require('tailwindcss-animate')],
};

export default config;
