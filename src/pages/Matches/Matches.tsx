import { LinkIcon } from "@chakra-ui/icons";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import GroupHeading from "../../components/GroupHeading/GroupHeading";

export default function Matches() {
  return (
    <div>
      <Breadcrumbs />

      <GroupHeading>Matches</GroupHeading>
      <MatchesContent />
    </div>
  )
}

export function MatchesContent() {
  const location = useLocation();
  const url = location.pathname === '/matches' ? '' : '/matches/';
  return (
    <div className={'LinkList'}>
      <ChakraLink as={RouterLink} to={`${url}create`}>Create match<LinkIcon /></ChakraLink>
      <ChakraLink as={RouterLink} to={`${url}update`}>Update match<LinkIcon /></ChakraLink>
      <ChakraLink as={RouterLink} to={`${url}delete`}>Delete match<LinkIcon /></ChakraLink>
    </div>
  )
}
