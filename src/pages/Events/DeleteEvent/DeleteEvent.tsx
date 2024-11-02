import { useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function DeleteEvent() {
  const [eventId, setEventId] = useState(-1);
  const [eventName, setEventName] = useState("");
  const [eventPickerKey, setEventPickerKey] = useState(1);

  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker dataType={dataType.event} key={eventPickerKey} changeHandler={event => selectEvent(Number(event.target.value))} />
        <ConfirmationButton isDisabled={eventId === -1} onClick={onOpen}>Delete event</ConfirmationButton>

        <ConfirmationModal isOpen={isOpen} onClose={onClose} body={`Do you really want to delete ${eventName === "" ? "Unnamed" : eventName}`} confirmFunction={deleteEvent} />
      </EndpointForm>
    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);

    fetch(backendUrl + `/backend/event/${newEventId}/`)
    .then(response => response.json())
    .then(data => {
      setEventName(data.description);
    })
    .catch(error => console.error("Error", error));
  }

  function deleteEvent() {
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
    ];

    fetchGracefully(backendUrl + `/backend/event/${eventId}/`,
    {
      method: "DELETE",
      headers: headers
    },
    "Event deleted successfully", toast);

    setEventPickerKey(eventPickerKey + 1);
  }
}
