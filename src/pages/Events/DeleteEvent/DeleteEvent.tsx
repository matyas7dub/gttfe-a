import { Button, Stack, useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { cacheRequestAndRelog } from "../../../components/Navbar/Login/LoginScript";

export default function DeleteEvent() {
  const [eventId, setEventId] = useState(0);
  const [eventName, setEventName] = useState("");
  const [eventPickerKey, setEventPickerKey] = useState(1);
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="column" spacing="2rem" className="Form">
        <DataPicker dataType={dataType.event} key={eventPickerKey} changeHandler={event => selectEvent(Number(event.target.value))} />
        <Button isDisabled={eventId === 0} onClick={onOpen} fontSize="2rem" colorScheme="red" width="fit-content" padding="1em">Delete event</Button>

        <ConfirmationModal isOpen={isOpen} onClose={onClose} body={`Do you really want to delete ${eventName === "" ? "Unnamed" : eventName}`} confirmFunction={deleteEvent} />
      </Stack>
    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);

    fetch(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/event/${newEventId}/`)
    )
    .then(response => response.json())
    .then(data => {
      setEventName(data.description);
    })
    .catch(error => console.error("Error", error));
  }

  function deleteEvent() {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);

    if (Number(localStorage.getItem("jwsTtl")) < Date.now()) {
      let headersArray = new Array();
      headers.forEach((value, key) => {
        headersArray.push([key, value]);
      });
      cacheRequestAndRelog(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/event/${eventId}/`),
        "DELETE",
        null,
        headersArray,
        "Event deleted successfully"
      )
    } else {
      fetch(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/event/${eventId}/`),
        {
          method: "DELETE",
          headers: headers,
        }
      )
      .then(async response => {
        if (response.ok) {
          toast({
            title: 'Event deleted successfully',
            status: 'success',
            duration: 5000,
            isClosable: true
          })
        } else {
          const data = await response.json();
          toast({
            title: 'Error',
            description: data.msg?? data.message?? 'Unknown error.',
            status: 'error',
            duration: 5000,
            isClosable: true
          })
        }
      })
      .catch(error => console.error("Error", error));
    }

    setEventPickerKey(eventPickerKey + 1);
  }
}
