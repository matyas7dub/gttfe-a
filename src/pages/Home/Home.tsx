import { Link as RouterLink } from 'react-router-dom';
import {
  Link as ChakraLink,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { RoleContent } from '../Role/Role';
import { GameContent } from '../Game/Game';
import { EventsContent } from '../Events/Events';
import { StagesContent } from '../Stages/Stages';
import { MatchesContent } from '../Matches/Matches';
import { FileContent } from '../File/File';

function Home() {
  return (
    <div className={'Home'}>
      <ChakraLink as={RouterLink} to="game"><Heading className={'Heading'}>Game</Heading></ChakraLink>
      <GameContent />
      <Divider className={'Divider'} />

      <ChakraLink as={RouterLink} to="role"><Heading className={'Heading'}>Role</Heading></ChakraLink>
      <RoleContent />
      <Divider className={'Divider'} />

      <ChakraLink as={RouterLink} to="events"><Heading className={'Heading'}>Events</Heading></ChakraLink>
      <EventsContent />
      <Divider className={'Divider'} />

      <ChakraLink as={RouterLink} to="stages"><Heading className={'Heading'}>Stages</Heading></ChakraLink>
      <StagesContent />
      <Divider className={'Divider'} />

      <ChakraLink as={RouterLink} to="matches"><Heading className={'Heading'}>Matches</Heading></ChakraLink>
      <MatchesContent />
      <Divider className={'Divider'} />

      <ChakraLink as={RouterLink} to="file"><Heading className={'Heading'}>File</Heading></ChakraLink>
      <FileContent />
      <Divider className={'Divider'} />
    </div>
  );
}

export default Home;
