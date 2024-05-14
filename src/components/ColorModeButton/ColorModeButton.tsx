import { Button, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

export default function ColorModeButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <div>
      <Button onClick={colorModeWrapper}>
        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      </Button>
    </div>
  )

  function colorModeWrapper() {
    if (colorMode === 'light') {
      document.documentElement.setAttribute('data-color-mode', 'dark');
    } else {
      document.documentElement.setAttribute('data-color-mode', 'light');
    }
    toggleColorMode();
  }
}
