import { FormControl, FormErrorMessage, FormLabel, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function CreateEvent() {
  const horizontalFormSpacing = "2rem";

  const [gameId, setGameId] = useState<Number>();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");

  const [gameError, setGameError] = useState(false);
  const [startError, setStartError] = useState(false);
  const [endError, setEndError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [eventTypeError, setEventTypeError] = useState(false);

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker dataType={dataType.game} isInvalid={gameError} changeHandler={(event) => {setGameId(Number(event.target.value)); setGameError(false)}} />

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl isInvalid={startError}>
            <FormLabel>Start time</FormLabel>
            <Input type="datetime-local" onChange={(event) => {setStart(event.target.value); setStartError(false)}} />
            <FormErrorMessage>You must pick a start time!</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={endError}>
            <FormLabel>End time</FormLabel>
            <Input type="time" onChange={(event) => {setEnd(event.target.value); setEndError(false)}} />
            <FormErrorMessage>You must pick an end time later than the start time!</FormErrorMessage>
          </FormControl>
        </Stack>

        <FormControl isInvalid={descriptionError}>
          <FormLabel>Description</FormLabel>
          <Input type="text" placeholder="This should be a descriptive name" onChange={(event) => {setDescription(event.target.value); setDescriptionError(false)}} />
          <FormErrorMessage>You must include a description!</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={eventTypeError}>
          <FormLabel>Event type</FormLabel>
          <Input type="text" onChange={(event) => {setEventType(event.target.value); setEventTypeError(false)}} />
          <FormErrorMessage>You must pick an event type!</FormErrorMessage>
        </FormControl>

        <ConfirmationButton onClick={createEvent}>Create event</ConfirmationButton>
      </EndpointForm>
    </div>
  )

  function createEvent() {
    let invalid = false;
  
    if (gameId == null) {
      setGameError(true);
      invalid = true;
    }

    if (start === "") {
      setStartError(true);
      invalid = true;
    }

    if (end === "") {
      setEndError(true);
      invalid = true;
    }

    if (description === "") {
      setDescriptionError(true);
      invalid = true;
    }

    if (eventType === "") {
      setEventTypeError(true);
      invalid = true;
    }

    if (invalid) {
      toast({
        title: 'Error',
        description: "Invalid input",
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    // formatting hell
    const startTimestamp = Date.parse(start);
    const startDateObject = new Date(startTimestamp);
    const startDate = startDateObject.toISOString().split('T')[0].replace(/-/g, '-')

    const startHours = String(startDateObject.getHours()).length === 1 ? `0${startDateObject.getHours()}` : startDateObject.getHours();
    const startMinutes = String(startDateObject.getMinutes()).length === 1 ? `0${startDateObject.getMinutes()}` : startDateObject.getMinutes();
    const startTime = `${startHours}:${startMinutes}:00`;

    const endTime = `${end}:00`;

    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];

    const body = {
      date: startDate,
      beginTime: startTime,
      endTime: endTime,
      gameId: gameId,
      description: description,
      eventType: eventType
    }

    fetchGracefully(backendUrl + "/backend/event/create",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers
    },
    "Event created successfully", toast);
  }
}
