import { QuestionIcon } from "@chakra-ui/icons";
import { FormControl, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, Tooltip } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { horizontalFormSpacing } from "../../config/config";
import { EventType } from "../EventTypeSelector/EventTypeSelector"

type EventTypeDataProps = {
  eventType: EventType,
  changeHandler: (data: string) => void,
  groupSize?: number,
  qualificationThreshold?: number
}

export type SwissData = {
  type: EventType,
  qualificationThreshold: number
}

export function parseSwissData(input: string): SwissData {
  const data = input.split(",");
  return {
    type: EventType.swiss,
    qualificationThreshold: Number(data[1])
  }
}

export type GroupsData = {
  type: EventType,
  groupSize: number,
}

export function parseGroupsData(input: string): GroupsData {
  const data = input.split(",");
  return {
    type: EventType.groups,
    groupSize: Number(data[1]),
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

type eventTypeOptions = {
  groupSize?: number;
  qualificationThreshold?: number;
};

export function stringifyEventType(type: EventType, options?: eventTypeOptions) {
  if (type === EventType.playoff) {
    return type;
  } else if (type === EventType.groups) {
    if (options?.groupSize !== undefined) {
      return `${type},${options.groupSize}`;
    } else {
      throw new Error(`Invalid groups arguments: ${options?.groupSize}`);
    }
  } else if (type === EventType.swiss) {
    if (options?.qualificationThreshold !== undefined) {
      return `${type},${options.qualificationThreshold}`
    } else {
      throw new Error(`Invalid swiss arguments: ${options?.qualificationThreshold}`)
    }
  } else {
    throw new Error(`Invalid event type: ${type}`)
  }
}

export default function EventTypeData(props: EventTypeDataProps) {
  const [swissQualificationThreshold, setSwissQualificationThreshold] = useState(1);

  const [groupSize, setGroupSize] = useState(1);

  useEffect(() => {
    if (props.eventType === EventType.playoff) {
      props.changeHandler("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.eventType]);

  useEffect(() => {
    if (props.eventType.startsWith(EventType.swiss)) {
      props.changeHandler(`,${swissQualificationThreshold}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swissQualificationThreshold])

  useEffect(() => {
    if (props.eventType.startsWith(EventType.groups)) {
      props.changeHandler(`,${groupSize}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupSize])

  return (
    <div>
      {
      props.eventType === EventType.playoff ? <></> :
      props.eventType.startsWith(EventType.swiss) ?
        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Qualification / Elimination threshold</FormLabel>
            <NumberInput min={1} value={props.qualificationThreshold} onChange={(_, value) => setSwissQualificationThreshold(value)}>
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
            <Stack direction="row" align="center">
              <FormLabel marginRight="-0.1em">Group size</FormLabel>
              <Tooltip label="There should be an even number of teams, so that everyone plays every round"><QuestionIcon marginBottom="0.3em" /></Tooltip>
            </Stack>
            <NumberInput min={1} value={props.groupSize} onChange={(_, value) => setGroupSize(value)}>
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
