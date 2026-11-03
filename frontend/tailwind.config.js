/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7f1',
          100: '#d8eedd',
          200: '#b4dbbe',
          300: '#82c294',
          500: '#4a9a5e',
          700: '#2e6f3d',
          800: '#235530',
          900: '#143326',
        },
        // Off-black text palette — never pure #000
        ink: {
          DEFAULT: '#171717',
          muted:   '#525252',
          subtle:  '#737373',
          faint:   '#A3A3A3',
        },
        // Off-white surface palette
        surface: {
          DEFAULT: '#F8FAFC',
          raised:  '#FFFFFF',
          sunken:  '#F1F5F9',
        },
        // Muted semantic status colors
        status: {
          'success-bg':   '#ECFDF5',
          'success-text': '#065F46',
          'error-bg':     '#FEF2F2',
          'error-text':   '#991B1B',
          'warning-bg':   '#FFFBEB',
          'warning-text': '#92400E',
          'info-bg':      '#EFF6FF',
          'info-text':    '#1E40AF',
        },
      },
      fontFamily: {
        sans:    ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-cabinet)', 'Cabinet Grotesk', 'var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        display: '-0.03em',
        heading: '-0.02em',
        tight:   '-0.01em',
        label:   '0.05em',
      },
      lineHeight: {
        display: '1.05',
        heading: '1.15',
        body:    '1.55',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // Legacy (keep for backward compat)
        soft: '0 10px 30px rgba(17, 24, 39, 0.08)',
        // New layered shadow system
        surface:  '0 1px 2px 0 rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.05)',
        elevated: '0 4px 6px -1px rgba(0,0,0,0.04), 0 16px 32px -4px rgba(0,0,0,0.09)',
        modal:    '0 8px 16px -4px rgba(0,0,0,0.06), 0 32px 64px -8px rgba(0,0,0,0.12)',
        glow:     '0 0 0 3px rgba(46,111,61,0.18)',
      },
    },
  },
  plugins: [],
};
