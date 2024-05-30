import { Box, HStack, Img, useColorMode} from '@chakra-ui/react';
import ColorModeButton from './ColorModeButton/ColorModeButton';
import Login from './Login/Login';

export default function Navbar() {
  const { colorMode, } = useColorMode();
  return (
      <HStack position="relative" width="100%" zIndex="10">
        <Img src={`${process.env.PUBLIC_URL}/GtLogo.svg`} filter={colorMode === "light" ? "brightness(0)" : ""} />
        <Box flexGrow="1" display="hidden" />
        <Login />
        <ColorModeButton />
      </HStack>
  );
}
