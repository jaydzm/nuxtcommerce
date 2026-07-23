import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  theme: {
    extend: {
      screens: {
        xs: '320px',
        '3xl': '1920px',
      },
      colors: {
        'secondary-text': '#888888',
        'secondary-text-d': '#a8a8a8',
        'alizarin-crimson': {
          50: '#edfbf3',
          100: '#d3f6e1',
          200: '#aaecc8',
          300: '#72dcaa',
          400: '#3ac487',
          500: '#07c160', // 微信原生主绿
          600: '#06ad56',
          700: '#058a46',
          800: '#086d3a',
          900: '#085a32',
          950: '#03331b',
        },
      },
    },
  },
};
