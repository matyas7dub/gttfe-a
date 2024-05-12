import { Link as RouterLink } from 'react-router-dom';
import {
  Link as ChakraLink,
  Heading,
  Divider,
  HStack,
} from '@chakra-ui/react';
import ColorModeButton from '../../components/ColorModeButton/ColorModeButton';
import Login from '../../components/Login/Login';
import { RoleContent } from '../Role/Role';
import { GameContent } from '../Game/Game';

function Home() {
  return (
    <div className={'Home'}>
      <HStack className={"topRight"}>
        <Login />
        <ColorModeButton />
      </HStack>

      <ChakraLink as={RouterLink} to="game"><Heading className={'Heading'}>Game</Heading></ChakraLink>
      <GameContent />
      <Divider className={'Divider'} />

      <ChakraLink as={RouterLink} to="Role"><Heading className={'Heading'}>Role</Heading></ChakraLink>
      <RoleContent />
      <Divider className={'Divider'} />
    </div>
  );
}

export default Home;
