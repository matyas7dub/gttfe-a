import { LinkIcon } from "@chakra-ui/icons";
import { Link as ChakraLink } from "@chakra-ui/react"
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import GroupHeading from "../../components/GroupHeading/GroupHeading";

export default function Teams() {
  return (
    <div>
      <Breadcrumbs />

      <GroupHeading>Teams</GroupHeading>
      <TeamsContent />
    </div>
  )
}

export function TeamsContent() {
  const location = useLocation();
  const url = location.pathname === '/teams' ? '' : '/teams/';
  return (
    <div className="LinkList">
      {/*<ChakraLink as={RouterLink} to={`${url}show`}>Show team<LinkIcon /></ChakraLink>*/}
      <ChakraLink as={RouterLink} to={`${url}game-export`}>Export teams for a game<LinkIcon /></ChakraLink>
    </div>
  )
}
