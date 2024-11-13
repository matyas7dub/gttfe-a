import { useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function DeleteStage() {
  const [eventId, setEventId] = useState<number>();
  const [stageId, setStageId] = useState<number>();
  const [stageName, setStageName] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker title="Event (Optional)" value={eventId} dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} toast={toast} />

        <DataPicker eventId={eventId} dataType={dataType.stage} changeHandler={event => selectStage(Number(event.target.value))} toast={toast} />

        <ConfirmationButton isDisabled={!stageId} onClick={onOpen}>Delete stage</ConfirmationButton>

        <ConfirmationModal isOpen={isOpen} onClose={onClose} body={`Do you really want to delete ${stageName}`} confirmFunction={deleteStage} />
      </EndpointForm>
    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);

    if (newEventId === 0) {
      setStageId(0);
    }
  }

  function selectStage(newStageId: number) {
    setStageId(newStageId);

    if (newStageId === 0) {
      return;
    }

    fetch(backendUrl + `/backend/stage/${newStageId}/`)
    .then(response => response.json())
    .then(data => {
      setEventId(data.eventId);
      setStageName(data.stageName);
    })
    .catch(error => console.error("Error", error));
  }
  function deleteStage() {
    fetchGracefully(backendUrl + `/backend/stage/${stageId}/`,
    {
      method: "DELETE"
    },
    "Stage deleted successfully", toast);
  }
}
