import { FormControl, FormErrorMessage, FormLabel, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import EventTypeData from "../../../components/EventTypeData/EventTypeData";
import EventTypeSelector, { EventType } from "../../../components/EventTypeSelector/EventTypeSelector";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl, horizontalFormSpacing } from "../../../config/config";

export default function CreateEvent() {
  const [gameId, setGameId] = useState<Number>();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventTypeData, setEventTypeData] = useState("");

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker dataType={dataType.game} changeHandler={(event) => {setGameId(Number(event.target.value))}} toast={toast} />

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Start time</FormLabel>
            <Input type="datetime-local" onChange={(event) => {setStart(event.target.value)}} />
            <FormErrorMessage>You must pick a start time!</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>End time</FormLabel>
            <Input type="time" onChange={(event) => {setEnd(event.target.value)}} />
            <FormErrorMessage>You must pick an end time later than the start time!</FormErrorMessage>
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input type="text" placeholder="This should be a descriptive name" onChange={(event) => {setDescription(event.target.value)}} />
          <FormErrorMessage>You must include a description!</FormErrorMessage>
        </FormControl>

        <EventTypeSelector changeHandler={event => {setEventType(event.target.value)}} />
        <EventTypeData eventType={eventType as EventType} changeHandler={value => setEventTypeData(value)} />

        <ConfirmationButton isDisabled={!gameId || !start || !end || !description || !eventType} onClick={createEvent}>Create event</ConfirmationButton>
      </EndpointForm>
    </div>
  )

  function createEvent() {
    // formatting hell
    const startTimestamp = Date.parse(start);
    const startDateObject = new Date(startTimestamp);
    const startDate = startDateObject.toISOString().split('T')[0].replace(/-/g, '-')

    const startHours = String(startDateObject.getHours()).length === 1 ? `0${startDateObject.getHours()}` : startDateObject.getHours();
    const startMinutes = String(startDateObject.getMinutes()).length === 1 ? `0${startDateObject.getMinutes()}` : startDateObject.getMinutes();
    const startTime = `${startHours}:${startMinutes}:00`;

    const endTime = `${end}:00`;

    const body = {
      date: startDate,
      beginTime: startTime,
      endTime: endTime,
      gameId: gameId,
      description: description,
      eventType: eventType + eventTypeData
    }

    fetchGracefully(backendUrl + "/backend/event/create",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {"Content-Type": "application/json"}
    },
    "Event created successfully", toast);
  }
}
