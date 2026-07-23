import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  theme: {
    extend: {
      screens: {
        xs: '320px',
        '3xl': '1920px',
      },
      colors: {
        'secondary-text': '#737373',
        'secondary-text-d': '#a8a8a8',
        'alizarin-crimson': {
          '50': '#ecfdf5',
          '100': '#d1fae5',
          '200': '#a7f3d0',
          '300': '#6ee7b7',
          '400': '#34d399',
          '500': '#10b981', // 核心绿色
          '600': '#059669',
          '700': '#047857',
          '800': '#065f46',
          '900': '#064e3b',
          '950': '#022c22',
        },
      },
    },
  },
};
