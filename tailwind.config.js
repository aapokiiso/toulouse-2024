/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'map-background': '#1f1f1f',
        'accent-primary': {
          '50': '#fef3f2',
          '100': '#fde7e6',
          '200': '#fad2d1',
          '300': '#f5aeac',
          '400': '#ef7d7e',
          '500': '#e44f54',
          '600': '#cd2e3a',
          '700': '#af2130',
          '800': '#921f2e',
          '900': '#7e1d2d',
        },
        'accent-secondary': {
          '50': '#ebf9ff',
          '100': '#d1f1ff',
          '200': '#aee8ff',
          '300': '#76dcff',
          '400': '#35c6ff',
          '500': '#07a3ff',
          '600': '#007dff',
          '700': '#0064ff',
          '800': '#0053d7',
          '900': '#0047a0',
        },
      },
    },
  },
  plugins: [],
}
