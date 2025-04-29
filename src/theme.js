import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0088e6',
      600: '#006bb3',
      700: '#004d80',
      800: '#00334d',
      900: '#001a26',
    },
    secondary: {
      50: '#f2f0ff',
      100: '#d9d6ff',
      200: '#c0bcff',
      300: '#a7a3ff',
      400: '#8e89ff',
      500: '#7570ff',
      600: '#5c57cc',
      700: '#433e99',
      800: '#2a2566',
      900: '#110c33',
    },
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            _disabled: {
              bg: 'brand.500',
            },
          },
          _active: { bg: 'brand.700' },
        },
        secondary: {
          bg: 'secondary.500',
          color: 'white',
          _hover: {
            bg: 'secondary.600',
            _disabled: {
              bg: 'secondary.500',
            },
          },
          _active: { bg: 'secondary.700' },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme;
