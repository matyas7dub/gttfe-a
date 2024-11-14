import { FormControl, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { horizontalFormSpacing } from "../../config/config";
import { EventType } from "../EventTypeSelector/EventTypeSelector"

type EventTypeDataProps = {
  eventType: EventType,
  changeHandler: (data: string) => void
}

export type SwissData = {
  teamCount: number
}

export function parseSwissData(input: string): SwissData {
  const data = input.split(",");
  return {
    teamCount: Number(data[1])
  }
}

export type GroupsData = {
  teamCount: number,
  advancingTeamCount: number
}

export function parseGroupsData(input: string): GroupsData {
  const data = input.split(",");
  return {
    teamCount: Number(data[1]),
    advancingTeamCount: Number(data[2])
  }
}

export default function EventTypeData(props: EventTypeDataProps) {
  const [swissTeamCount, setSwissTeamCount] = useState(1);

  const [groupsTeamCount, setGroupsTeamCount] = useState(1);
  const [groupsAdvancingTeamCount, setGroupsAdvancingTeamCount] = useState(1);

  useEffect(() => {
    props.changeHandler(`,${swissTeamCount}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swissTeamCount])

  useEffect(() => {
    props.changeHandler(`,${groupsTeamCount},${groupsAdvancingTeamCount}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsTeamCount, groupsAdvancingTeamCount])

  return (
    <div>
      {
      props.eventType === EventType.playoff ? <></> :
      props.eventType === EventType.swiss ?
        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Advancing team count</FormLabel>
            <NumberInput min={1} value={swissTeamCount} onChange={(_, value) => setSwissTeamCount(value)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack> :
      props.eventType === EventType.groups ?
        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Team count in one group</FormLabel>
            <NumberInput min={1} value={groupsTeamCount} onChange={(_, value) => setGroupsTeamCount(value)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Advancing team count</FormLabel>
            <NumberInput min={1} value={groupsAdvancingTeamCount} onChange={(_, value) => setGroupsAdvancingTeamCount(value)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack> : <></>
      }
    </div>
  )
}
