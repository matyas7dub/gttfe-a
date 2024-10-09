import { Alert, AlertIcon, AlertTitle, Button, FormControl, FormLabel, Input, Stack, Tooltip } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";

/*
This is not done yet:
  - the permission for listing stages from an event is broken
  - I don't know how the bracket system will work yet
*/

export default function AutofillStage() {
  const [eventId, setEventId] = useState<number>();
  const [previousStageName, setPreviousStageName] = useState("");
  const [stageName, setStageName] = useState("");

  return (
    <div>
      <Breadcrumbs />

      <Stack direction="column" spacing="3rem" className="Form">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>This is currently a work in progress (not working)</AlertTitle>
        </Alert>

        <Tooltip label="As this uses multiple requests, it is not *yet* implemented to automatically relog.">
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Make sure you are logged in!</AlertTitle>
          </Alert>
        </Tooltip>

        <DataPicker dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} />

        <FormControl isDisabled={eventId == null}>
          <FormLabel>Stage name</FormLabel>
          <Input onChange={event => setStageName(event.target.value)} marginBottom="1rem"/>
          {previousStageName !== "" ? `Previous stage name was ${previousStageName}` : ""}
        </FormControl>

        <Button isDisabled={stageName === ""} onClick={createStage} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Create stage and matches</Button>
      </Stack>
    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);
    const previousStages: [number, number][] = []; // array of [id, index]
    fetch(process.env.REACT_APP_BACKEND_URL + `/backend/event/${newEventId}/stages/`)
    .then(response => response.json())
    .then(stages => {
      let highestIndex = -1;
      for (let stage of stages) {
        previousStages.push([stage.stageId, stage.stageIndex]);
        if (stage.stageIndex > highestIndex) {
          setPreviousStageName(stage.stageName);
        }
      }
      console.debug(previousStages);
    })
    .catch(error => console.error("Error", error));
  }

  function createStage() {
    
  }
}
