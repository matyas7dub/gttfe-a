import { LinkIcon } from "@chakra-ui/icons";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import GroupHeading from "../../components/GroupHeading/GroupHeading";

export default function Stages() {
  return (
    <div>
      <Breadcrumbs />

      <GroupHeading>Stages</GroupHeading>
      <StagesContent />
    </div>
  )
}

export function StagesContent() {
  const location = useLocation();
  const url = location.pathname === '/stages' ? '' : '/stages/';
  return (
    <div className={'LinkList'}>
      <ChakraLink as={RouterLink} to={`${url}create`}>Create stage<LinkIcon /></ChakraLink>
      <ChakraLink as={RouterLink} to={`${url}update`}>Update stage<LinkIcon /></ChakraLink>
      <ChakraLink as={RouterLink} to={`${url}delete`}>Delete stage<LinkIcon /></ChakraLink>
      <ChakraLink as={RouterLink} to={`${url}generate`}>Generate stage<LinkIcon /></ChakraLink>
    </div>
  )
}
