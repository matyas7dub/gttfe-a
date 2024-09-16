import { Button, Stack, useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { cacheRequestAndRelog } from "../../../components/Navbar/Login/LoginScript";

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

        <DataPicker dataType={dataType.stage} eventId={eventId?? undefined} changeHandler={event => selectStage(Number(event.target.value))} /> 

        <Button isDisabled={stageId == undefined} onClick={onOpen} fontSize="2rem" colorScheme="red" width="fit-content" padding="1em">Delete stage</Button>

        <ConfirmationModal isOpen={isOpen} onClose={onClose} body={`Do you really want to delete ${stageName}`} confirmFunction={deleteStage} />
      </Stack>
    </div>
  )

  function selectStage(newStageId: Number) {
    setStageId(newStageId);

    fetch(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/stage/${newStageId}/`)
    )
    .then(response => response.json())
    .then(data => {
      setStageName(data.stageName);
    })
    .catch(error => console.error("Error", error));
  }
  function deleteStage() {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);

    if (Number(localStorage.getItem("jwsTtl")) < Date.now()) {
      let headersArray = new Array();
      headers.forEach((value, key) => {
        headersArray.push([key, value]);
      });
      cacheRequestAndRelog(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/stage/${stageId}/`),
        "DELETE",
        null,
        headersArray,
        "Stage deleted successfully"
      )
    } else {
      fetch(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/stage/${stageId}/`),
        {
          method: "DELETE",
          headers: headers,
        }
      )
      .then(async response => {
        if (response.ok) {
          toast({
            title: 'Stage deleted successfully',
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
  }
}
