import { Button, Stack, useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";

export default function DeleteStage() {
  const [eventId, setEventId] = useState<Number>();
  const [stageId, setStageId] = useState<Number>();
  const [stageName, setStageName] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="column" spacing="2rem" className="Form">
        <DataPicker title="Event (Optional)" dataType={dataType.event} changeHandler={event => setEventId(Number(event.target.value))} />

        <DataPicker options={{eventId: eventId?? undefined}} dataType={dataType.stage} changeHandler={event => selectStage(Number(event.target.value))} /> 

        <Button isDisabled={!stageId} onClick={onOpen} fontSize="2rem" colorScheme="red" width="fit-content" padding="1em">Delete stage</Button>

        <ConfirmationModal isOpen={isOpen} onClose={onClose} body={`Do you really want to delete ${stageName}`} confirmFunction={deleteStage} />
      </Stack>
    </div>
  )

  function selectStage(newStageId: Number) {
    setStageId(newStageId);

    fetch(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + `/backend/stage/${newStageId}/`)
    )
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

    fetchGracefully(((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + `/backend/stage/${stageId}/`),
    "DELETE", null, headers, "Stage deleted successfully", toast);
  }
}
