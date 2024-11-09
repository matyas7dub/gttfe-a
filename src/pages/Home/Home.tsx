import { Link as RouterLink } from 'react-router-dom';
import {
  Link as ChakraLink,
  Stack,
} from '@chakra-ui/react';
import { RoleContent } from '../Role/Role';
import { GameContent } from '../Game/Game';
import { EventsContent } from '../Events/Events';
import { StagesContent } from '../Stages/Stages';
import { MatchesContent } from '../Matches/Matches';
import { FileContent } from '../File/File';
import GroupHeading from '../../components/GroupHeading/GroupHeading';
import FormDivider from '../../components/FormDivider/FormDivider';
import { UsersContent } from '../Users/Users';

function Home() {
  return (
    <Stack direction="column" minWidth="20em" width="fit-content">
      <ChakraLink as={RouterLink} to="events"><GroupHeading>Events</GroupHeading></ChakraLink>
      <EventsContent />
      <FormDivider />

      <ChakraLink as={RouterLink} to="stages"><GroupHeading>Stages</GroupHeading></ChakraLink>
      <StagesContent />
      <FormDivider />

      <ChakraLink as={RouterLink} to="matches"><GroupHeading>Matches</GroupHeading></ChakraLink>
      <MatchesContent />
      <FormDivider />

      <ChakraLink as={RouterLink} to="game"><GroupHeading>Game</GroupHeading></ChakraLink>
      <GameContent />
      <FormDivider />

      <ChakraLink as={RouterLink} to="role"><GroupHeading>Role</GroupHeading></ChakraLink>
      <RoleContent />
      <FormDivider />

      <ChakraLink as={RouterLink} to="users"><GroupHeading>Users</GroupHeading></ChakraLink>
      <UsersContent />
      <FormDivider />

      <ChakraLink as={RouterLink} to="file"><GroupHeading>File</GroupHeading></ChakraLink>
      <FileContent />
      <FormDivider />
    </Stack>
  );
}

export default Home;
