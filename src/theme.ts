import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  colors: {
    GttBlue: {
      100: "#040610",
      200: "#080E1F",
      300: "#0B162D",
      400: "#0C1A34",
      500: "#0F203F",
      600: "#112649"
    },
    GttOrange: {
      100: "#FF9E00",
      200: "#FFA303",
      300: "#FFAF0A",
      400: "#FFD60A",
      500: "#FF9E00", // 100 repeated
      600: "#FFAF0A", // 300 repeated
    },
    gray: {
      700: "#080E1F", // GttBlue.400 for popups
      800: "#112649", // GttBlue.600 for dark text?
    },
    blue: { // == GttOrange ... I know
      200: "#FFAF0A",
      300: "#FFA303",
      500: "#FF9E00",
      600: "#FFAF0A",
    }
  },
  fonts: {
    body: "Montserrat ExtraBold",
    heading: "Montserrat ExtraBold"
  },
  components: {
    Heading: {
      baseStyle: {
        color: "GttOrange.100",
      }
    },
    Button: {
      baseStyle: {
        color: "white"
      }
    }
  },
  styles: {
    global: (props: any) =>  ({
      body: {
        color: props.colorMode === "dark" ? "white" : "black",
        bg: props.colorMode === "dark" ? "GttBlue.100" : "white"
      },
    })
  },
});

export default theme;
