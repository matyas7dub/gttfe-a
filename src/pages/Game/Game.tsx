import { Link as ChakraLink } from "@chakra-ui/react"
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LinkIcon } from "@chakra-ui/icons";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs"
import GroupHeading from "../../components/GroupHeading/GroupHeading";

export default function Game() {
  return (
    <div>
      <Breadcrumbs />

      <GroupHeading>Game</GroupHeading>
      <GameContent />
    </div>
  )
}

export function GameContent() {
  const location = useLocation();
  const url = location.pathname === '/game' ? '' : '/game/';
  return (
    <div>
      <div className={'LinkList'}>
        <ChakraLink as={RouterLink} to={`${url}create`}>Create a game<LinkIcon /></ChakraLink>
        <ChakraLink as={RouterLink} to={`${url}update`}>Update a game<LinkIcon /></ChakraLink>
        <ChakraLink as={RouterLink} to={`${url}page-update`}>Update a game page<LinkIcon /></ChakraLink>
      </div>
    </div>
  )
}
