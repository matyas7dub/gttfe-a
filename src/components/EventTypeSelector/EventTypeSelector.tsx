import { QuestionIcon } from "@chakra-ui/icons";
import { FormControl, FormLabel, Select, Stack, Tooltip } from "@chakra-ui/react";
import { ChangeEventHandler } from "react";

type EventTypeSelectorProps = {
  changeHandler: ChangeEventHandler<HTMLSelectElement>,
  value?: EventType | string | undefined,
  isDisabled?: boolean
}

export enum EventType {
  none = "none",
  playoff = "playoff",
  swiss = "swiss",
  groups = "groups"
}

export default function EventTypeSelector(props: EventTypeSelectorProps) {
  return (
    <FormControl>
      <Stack direction="row" align="center">
        <FormLabel marginRight="-0.1em">Event type</FormLabel>
        <Tooltip label="This affects how the event is displayed and how stages are generated"><QuestionIcon marginBottom="0.3em" /></Tooltip>
      </Stack>
      <Select isDisabled={props.isDisabled} value={props.value} placeholder="Select an event type" onChange={props.changeHandler}>
        <option value={EventType.playoff}>Bracket</option>
        <option value={EventType.swiss}>Swiss</option>
        <option value={EventType.groups}>Groups</option>
      </Select>
    </FormControl>
  )
}
