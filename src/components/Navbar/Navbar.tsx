import { Box, HStack, Img, useColorMode} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import ColorModeButton from './ColorModeButton/ColorModeButton';
import Login from './Login/Login';

export default function Navbar() {
  const { colorMode, } = useColorMode();
  return (
      <HStack position="relative" width="100%" zIndex="10">
        <Link to="/"><Img src={"/GtLogo.svg"} filter={colorMode === "light" ? "brightness(0)" : ""} /></Link>
        <Box flexGrow="1" display="hidden" />
        <Login />
        <ColorModeButton />
      </HStack>
  );
}
