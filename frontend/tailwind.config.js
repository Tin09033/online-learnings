/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Surface colors for depth layering
        surface: {
          raised: '#ffffff',
          base: '#f8fafc',
          lowered: '#f1f5f9',
          sunken: '#e2e8f0',
        },
        // Depth shades for elevation hierarchy
        depth: {
          0: '#ffffff',
          1: '#f8fafc',
          2: '#f1f5f9',
          3: '#e2e8f0',
          4: '#cbd5e1',
        }
      },
      boxShadow: {
        // Premium Double-Layer Shadows
        'premium-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'premium-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'premium-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'premium-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        
        // Small depth shadow - subtle elevation
        'depth-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        // Medium depth shadow - standard elevation
        'depth-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        // Large depth shadow - prominent elevation
        'depth-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        // XL depth shadow - hover/focus prominence
        'depth-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        // Dual-layer shadows (light top + dark bottom)
        'dual-sm': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'dual-md': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
        'dual-lg': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        // Inset shadows for recessed elements
        'inset-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'inset-md': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'inset-lg': 'inset 0 4px 6px 0 rgba(0, 0, 0, 0.1)',
        // Inset with light bottom (sunken effect)
        'sunken-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.1), inset 0 -1px 0 0 rgba(255, 255, 255, 0.05)',
        'sunken-md': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1), inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)',
        // Glow shadows
        'glow-primary': '0 0 20px 2px rgba(37, 99, 235, 0.3)',
        'glow-primary-sm': '0 0 10px 1px rgba(37, 99, 235, 0.2)',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'gradient-shimmer': 'gradient-shimmer 3s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        // Gradient for elevated/shiny effect
        'elevated': 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
        'elevated-strong': 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%)',
        // Primary color gradients with depth
        'primary-gradient': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'primary-gradient-dark': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      }
    },
  },
  plugins: [],
}
