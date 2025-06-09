import Lara from '@primeng/themes/lara';
import {definePreset} from '@primeng/themes';

export const ThemeBlack = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{gray.50}',
      100: '{gray.100}',
      200: '{gray.200}',
      300: '{gray.300}',
      400: '{gray.400}',
      500: '{gray.500}',
      600: '{gray.600}',
      700: '{gray.700}',
      800: '{gray.800}',
      900: '{gray.900}',
      950: '{gray.950}'
    }
  }
});
