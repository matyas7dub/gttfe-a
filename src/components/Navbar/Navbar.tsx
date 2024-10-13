import { Box, HStack, Img, useColorMode} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import ColorModeButton from './ColorModeButton/ColorModeButton';
import Login from './Login/Login';
import {loginPathRelative, publicUrl} from '../../config/config';

export default function Navbar() {
  const { colorMode, } = useColorMode();
  const location = useLocation();

  if (location.pathname === loginPathRelative) {
    return (
      <></>
    );
  } else {
    return (
        <HStack position="relative" width="100%" zIndex="10">
          <Link to="/"><Img src={`${publicUrl}/GtLogo.svg`} filter={colorMode === "light" ? "brightness(0)" : ""} /></Link>
          <Box flexGrow="1" display="hidden" />
          <Login />
          <ColorModeButton />
        </HStack>
    );
  }
}
