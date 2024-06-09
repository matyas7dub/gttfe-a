import { LinkIcon } from "@chakra-ui/icons";
import { Heading, Link as ChakraLink, FormControl, FormLabel, FormErrorMessage, Select } from "@chakra-ui/react";
import { isDisabled } from "@testing-library/user-event/dist/utils";
import { ChangeEventHandler, useEffect, useState } from "react";
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

type EventPickerProps = {
  isInvalid?: boolean,
  changeHandler: ChangeEventHandler<HTMLSelectElement>,
  default?: string,
  value?: number,
  isDisabled?: boolean,
}

export function EventPicker(props: EventPickerProps) {
  const [events, setEvents] = useState<JSX.Element[]>();

  useEffect(() => {
    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + '/backend/event/list')
    )
    .then(response => response.json())
    .then(data => {
      let eventElems: JSX.Element[] = [];
      for (let event of data) {
        eventElems.push(
          <option key={event.eventId} value={event.eventId}>{event.description}</option>
        );
      }
      setEvents(eventElems);
    })
    .catch(error => console.error('Error:', error));
  }, []);

  return (
    <FormControl isInvalid={props.isInvalid ?? undefined}>
      <FormLabel>Event</FormLabel>
      <Select onChange={props.changeHandler} value={props.value?? undefined} isDisabled={props.isDisabled?? undefined}
        placeholder={props.default == undefined ? "Select an event" : props.default}>
        {events}
      </Select>
      <FormErrorMessage>You must select an event!</FormErrorMessage>
    </FormControl>
  )
}
