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
  const [eventId, setEventId] = useState<Number>();
  const [stageId, setStageId] = useState<Number>();
  const [stageName, setStageName] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker title="Event (Optional)" dataType={dataType.event} changeHandler={event => setEventId(Number(event.target.value))} toast={toast} />

        <DataPicker options={{eventId: eventId?? undefined}} dataType={dataType.stage} changeHandler={event => selectStage(Number(event.target.value))} toast={toast} />

        <ConfirmationButton isDisabled={!stageId} onClick={onOpen}>Delete stage</ConfirmationButton>

        <ConfirmationModal isOpen={isOpen} onClose={onClose} body={`Do you really want to delete ${stageName}`} confirmFunction={deleteStage} />
      </EndpointForm>
    </div>
  )

  function selectStage(newStageId: Number) {
    setStageId(newStageId);

    fetch(backendUrl + `/backend/stage/${newStageId}/`)
    .then(response => response.json())
    .then(data => {
      setStageName(data.stageName);
    })
    .catch(error => console.error("Error", error));
  }
  function deleteStage() {
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
    ];

    fetchGracefully(backendUrl + `/backend/stage/${stageId}/`,
    {
      method: "DELETE",
      headers: headers
    },
    "Stage deleted successfully", toast);
  }
}
