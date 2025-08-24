import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx,js,jsx,mdx}',
    './src/components/**/*.{ts,tsx,js,jsx,mdx}',
    './src/lib/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.25rem' }], // Increased from 0.75rem
        'sm': ['1rem', { lineHeight: '1.375rem' }],    // Increased from 0.875rem
        'base': ['1.125rem', { lineHeight: '1.5rem' }], // Increased from 1rem
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],   // Increased from 1.125rem
        'xl': ['1.5rem', { lineHeight: '2rem' }],       // Increased from 1.25rem
        '2xl': ['1.75rem', { lineHeight: '2.25rem' }],  // Increased from 1.5rem
        '3xl': ['2rem', { lineHeight: '2.5rem' }],      // Increased from 1.875rem
      },
      fontFamily: {
        display: ['var(--font-vt323)', 'monospace'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}

export default config
