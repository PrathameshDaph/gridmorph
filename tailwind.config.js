/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ctrl: {
          bg: '#F2F5F3',          // Soft pale sage-white background
          bgDark: '#EBF1EE',      // Subtle secondary background
          surface: '#FFFFFF',     // Crisp pure white main surface
          elevated: '#F7FAF8',    // Subtle elevated card surface
          border: '#DFE7E2',      // Clean soft border
          borderLight: '#EDF2EE', // Very soft inner border
          
          // Typography
          textPrimary: '#1A2821',   // Deep slate-charcoal text
          textSecondary: '#5A6E64', // Soft muted gray-green
          textTertiary: '#8A9B92',  // Subtle metadata text

          // Primary Clean Brand Green (from reference image)
          accent: '#237A5C',      // Deep forest teal / clean green button
          accentHover: '#1C674E',
          accentLight: '#E8F6F0', // Soft pastel mint card background
          accentBorder: '#BEE4D4',// Soft mint border
          
          // Soft Pastel Tints (from reference nutrition blocks)
          tintGreen: '#E8F6F0',
          tintGreenBorder: '#BEE4D4',
          tintGreenText: '#1E7557',

          tintPeach: '#FFF3EB',
          tintPeachBorder: '#FCD7C2',
          tintPeachText: '#D9651E',

          tintRose: '#FDF0F3',
          tintRoseBorder: '#F8CCD5',
          tintRoseText: '#D93B5E',

          tintSand: '#FAF5E8',
          tintSandBorder: '#F2E2BE',
          tintSandText: '#B88114',

          tintBlue: '#EDF6FC',
          tintBlueBorder: '#C8E2F5',
          tintBlueText: '#2076BD',

          // Status colors
          warning: '#D97706',     // Muted solar amber
          critical: '#D93B5E',    // Soft berry rose red
          success: '#237A5C',     // Clean green
        }
      },
      borderRadius: {
        'panel': '12px',
        'card': '10px',
        'btn': '8px',
        'input': '8px',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'IBM Plex Sans', '-apple-system', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(24, 45, 36, 0.04)',
        'card': '0 4px 16px -2px rgba(24, 45, 36, 0.05)',
        'panel': '0 6px 24px -4px rgba(24, 45, 36, 0.06)',
      }
    },
  },
  plugins: [],
}
