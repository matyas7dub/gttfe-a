import { Link as ChakraLink, HStack, Heading } from "@chakra-ui/react"
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LinkIcon } from "@chakra-ui/icons";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs"
import ColorModeButton from "../../components/ColorModeButton/ColorModeButton"
import Login from "../../components/Login/Login"

export default function Game() {
  return (
    <div>
      <Breadcrumbs />
      <HStack className="topRight">
      <Login />
      <ColorModeButton />
      </HStack>

      <Heading className="Heading">Game</Heading>
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
        <ChakraLink as={RouterLink} to={`${url}page-update`}>Game page update<LinkIcon /></ChakraLink>
        <ChakraLink as={RouterLink} to={`${url}update`}>Update a game<LinkIcon /></ChakraLink>
      </div>
    </div>
  )
}
