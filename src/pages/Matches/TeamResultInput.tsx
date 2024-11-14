import { CreateToastFnReturn, Flex, FormControl, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import DataPicker, { dataType } from "../../components/DataPicker/DataPicker";
import FormDivider from "../../components/FormDivider/FormDivider";
import { backendUrl, horizontalFormSpacing } from "../../config/config";

type TeamResultInputProps = {
  stageId: number | undefined,
  firstTeamId?: number,
  setFirstTeamId: (Id: number) => void,
  firstTeamResult?: number,
  setFirstTeamResult: (Result: number) => void,
  secondTeamId?: number,
  setSecondTeamId: (Id: number) => void
  secondTeamResult?: number,
  setSecondTeamResult: (Result: number) => void,
  isDisabled?: boolean,
  toast: CreateToastFnReturn,
}

export default function TeamResultInput(props: TeamResultInputProps) {
  const [gameId, setGameId] = useState<Number>();

  useEffect(() => {
    if (props.stageId) {
      fetch(backendUrl + `/backend/stage/${props.stageId}/`)
      .then(response => response.json())
      .then(data => gameIdFromEvent(data.eventId))
      .catch(error => console.error("Error", error));
    }
  }, [props.stageId])

  function gameIdFromEvent(eventId: number) {
    fetch(backendUrl + `/backend/event/${eventId}/`)
    .then(response => response.json())
    .then(data => setGameId(data.gameId))
    .catch(error => console.error("Error", error));
  }

  return (
    <Flex>
      <Stack direction="column" spacing={horizontalFormSpacing} flexGrow="1">
        <DataPicker title="First team" gameId={gameId} value={props.firstTeamId} dataType={dataType.teams} isDisabled={!gameId || props.isDisabled} changeHandler={(event) => {props.setFirstTeamId(Number(event.target.value))}} toast={props.toast} />

        <FormControl>
          <FormLabel>First team score</FormLabel>
          <NumberInput isDisabled={props.isDisabled} value={props.firstTeamResult} onChange={(_, value) => {props.setFirstTeamResult(value)}}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </Stack>

      <div style={{marginLeft: "2rem", marginRight: "2rem"}}>
        <FormDivider orientation="vertical" />
      </div>

      <Stack direction="column" spacing="3rem" flexGrow="1">
        <DataPicker title="Second team" gameId={gameId} value={props.secondTeamId} dataType={dataType.teams} isDisabled={!gameId || props.isDisabled} changeHandler={(event) => {props.setSecondTeamId(Number(event.target.value))}} toast={props.toast} />

        <FormControl>
          <FormLabel>Second team score</FormLabel>
          <NumberInput isDisabled={props.isDisabled} value={props.secondTeamResult} onChange={(_, value) => {props.setSecondTeamResult(value)}}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </Stack>
    </Flex>
  )
}
