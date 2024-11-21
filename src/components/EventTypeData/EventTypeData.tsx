import { FormControl, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { horizontalFormSpacing } from "../../config/config";
import { EventType } from "../EventTypeSelector/EventTypeSelector"

type EventTypeDataProps = {
  eventType: EventType,
  changeHandler: (data: string) => void,
  teamCount?: number,
  advancingTeamCount?: number
}

export type SwissData = {
  type: EventType,
  advancingTeamCount: number
}

export function parseSwissData(input: string): SwissData {
  const data = input.split(",");
  return {
    type: EventType.swiss,
    advancingTeamCount: Number(data[1])
  }
}

export type GroupsData = {
  type: EventType,
  teamCount: number,
  advancingTeamCount: number
}

export function parseGroupsData(input: string): GroupsData {
  const data = input.split(",");
  return {
    type: EventType.groups,
    teamCount: Number(data[1]),
    advancingTeamCount: Number(data[2])
  }
}

export function parseEventType(input: EventType) {
  if (input.startsWith(EventType.playoff)) {
    return { type: EventType.playoff }
  } else if (input.startsWith(EventType.swiss)) {
    return parseSwissData(input);
  } else if (input.startsWith(EventType.groups)) {
    return parseGroupsData(input);
  } else {
    return { type: EventType.none };
  }
}

export function stringifyEventType(type: EventType, advancingTeamCount?: number, teamCount?: number) {
  if (type === EventType.playoff) {
    return type;
  } else if (type === EventType.groups) {
    if (advancingTeamCount !== undefined && teamCount !== undefined) {
      return `${type},${teamCount},${advancingTeamCount}`;
    } else {
      throw new Error(`Invalid event type arguments: ${advancingTeamCount} ${teamCount}`);
    }
  } else if (type === EventType.swiss && advancingTeamCount !== undefined) {
    if (advancingTeamCount !== undefined) {
      return `${type},${advancingTeamCount}`
    } else {
      throw new Error(`Invalid event type arguments: ${advancingTeamCount}`)
    }
  } else {
    throw new Error(`Invalid event type: ${type}`)
  }
}

export default function EventTypeData(props: EventTypeDataProps) {
  const [swissTeamCount, setSwissTeamCount] = useState(1);

  const [groupsTeamCount, setGroupsTeamCount] = useState(1);
  const [groupsAdvancingTeamCount, setGroupsAdvancingTeamCount] = useState(1);

  useEffect(() => {
    if (props.eventType === EventType.playoff) {
      props.changeHandler("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.eventType]);

  useEffect(() => {
    if (props.eventType.startsWith(EventType.swiss)) {
      props.changeHandler(`,${swissTeamCount}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swissTeamCount])

  useEffect(() => {
    if (props.eventType.startsWith(EventType.groups)) {
      props.changeHandler(`,${groupsTeamCount},${groupsAdvancingTeamCount}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsTeamCount, groupsAdvancingTeamCount])

  return (
    <div>
      {
      props.eventType === EventType.playoff ? <></> :
      props.eventType.startsWith(EventType.swiss) ?
        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Advancing team count</FormLabel>
            <NumberInput min={1} value={props.teamCount?? swissTeamCount} onChange={(_, value) => setSwissTeamCount(value)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack> :
      props.eventType.startsWith(EventType.groups) ?
        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Team count in one group</FormLabel>
            <NumberInput min={1} value={props.teamCount?? groupsTeamCount} onChange={(_, value) => setGroupsTeamCount(value)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Advancing team count per group</FormLabel>
            <NumberInput min={1} value={props.advancingTeamCount?? groupsAdvancingTeamCount} onChange={(_, value) => setGroupsAdvancingTeamCount(value)}>
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
