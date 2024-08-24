import { LinkIcon } from "@chakra-ui/icons";
import { Heading, Link as ChakraLink } from "@chakra-ui/react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";

export default function Events() {
  return (
    <div>
      <Breadcrumbs />

     <Heading className="Heading">Events</Heading>
     <EventsContent />
    </div>
  )
}

export function EventsContent() {
  const location = useLocation();
  const url = location.pathname === '/events' ? '' : '/events/';
  return (
    <div>
      <div className={'LinkList'}>
        <ChakraLink as={RouterLink} to={`${url}create`}>Create event<LinkIcon /></ChakraLink>
        <ChakraLink as={RouterLink} to={`${url}update`}>Update event<LinkIcon /></ChakraLink>
        <ChakraLink as={RouterLink} to={`${url}delete`}>Delete event<LinkIcon /></ChakraLink>
      </div>
    </div>
  )
}
