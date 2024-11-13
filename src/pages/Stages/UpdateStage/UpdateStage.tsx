import { QuestionIcon } from "@chakra-ui/icons";
import { FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Tooltip, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function UpdateStage() {
  const [eventId, setEventId] = useState<number>();
  const [stageId, setStageId] = useState<number>();
  const [stageName, setStageName] = useState("");
  const [stageIndex, setStageIndex] = useState<number>();

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker title="Event (Optional)" value={eventId} dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} toast={toast} />

        <DataPicker eventId={eventId} value={stageId} dataType={dataType.stage} changeHandler={event => selectStage(Number(event.target.value))} toast={toast} />

        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input isDisabled={!stageId} value={stageName} type="text" onChange={event => setStageName(event.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>Index/Level <Tooltip label="i. e. quarterfinals = 1, semifinals = 2, finals = 3"><QuestionIcon /></Tooltip></FormLabel>
          <NumberInput isDisabled={!stageId} value={stageIndex} onChange={(_, value) => {setStageIndex(value)}}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <ConfirmationButton isDisabled={!stageId} onClick={updateStage}>Update stage</ConfirmationButton>
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

    fetch(backendUrl + `/backend/stage/${newStageId}/`)
    .then(response => response.json())
    .then(data => {
      setEventId(data.eventId);
      setStageName(data.stageName);
      setStageIndex(data.stageIndex);
    })
    .catch(error => console.error("Error", error));
  }

  function updateStage() {
    fetchGracefully(backendUrl + `/backend/stage/${stageId}/`,
    {
      method: "PUT",
      body: JSON.stringify({
        eventId: eventId,
        stageName: stageName,
        stageIndex: stageIndex
      }),
      headers: {"Content-Type": "application/json"}
    },
    "Stage updated successfully", toast);
  }
}
