import { Divider, FormControl, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import DataPicker, { dataType } from "../../components/DataPicker/DataPicker";

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
  isDisabled?: boolean
}

export default function TeamResultInput(props: TeamResultInputProps) {
  const horizontalFormSpacing = "2rem";

  const [gameId, setGameId] = useState<Number>();

  useEffect(() => {
    if (props.stageId) {
      fetch(process.env.REACT_APP_BACKEND_URL + `/backend/stage/${props.stageId}/`)
      .then(response => response.json())
      .then(data => gameIdFromEvent(data.eventId))
      .catch(error => console.error("Error", error));
    }
  }, [props.stageId])

  function gameIdFromEvent(eventId: number) {
    fetch(process.env.REACT_APP_BACKEND_URL + `/backend/event/${eventId}/`)
    .then(response => response.json())
    .then(data => setGameId(data.gameId))
    .catch(error => console.error("Error", error));
  }

  return (
    <Stack direction="row" spacing={horizontalFormSpacing}>
      <Stack direction="column" spacing="3rem">
        <DataPicker options={{gameId: gameId}} value={props.firstTeamId?? undefined} dataType={dataType.teams} isDisabled={!gameId || props.isDisabled} changeHandler={(event) => {props.setFirstTeamId(Number(event.target.value))}} />

        <FormControl>
          <FormLabel>First team result</FormLabel>
          <NumberInput isDisabled={props.isDisabled} defaultValue={props.firstTeamResult?? undefined} onChange={(_, value) => {props.setFirstTeamResult(value)}}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </Stack>

      <div>
        <Divider orientation="vertical" className="Divider" />
      </div>

      <Stack direction="column" spacing="3rem">
        <DataPicker options={{gameId: gameId}} value={props.secondTeamId?? undefined} dataType={dataType.teams} isDisabled={!gameId || props.isDisabled} changeHandler={(event) => {props.setSecondTeamId(Number(event.target.value))}} />

        <FormControl>
          <FormLabel>Second team result</FormLabel>
          <NumberInput isDisabled={props.isDisabled} defaultValue={props.secondTeamResult?? undefined} onChange={(_, value) => {props.setSecondTeamResult(value)}}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </Stack>
    </Stack>
  )
}
