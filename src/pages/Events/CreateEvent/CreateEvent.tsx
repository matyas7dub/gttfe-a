import { Button, FormControl, FormErrorMessage, FormLabel, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { cacheRequestAndRelog } from "../../../components/Navbar/Login/LoginScript";

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
      <Stack direction="column" spacing="3rem" className="Form">
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

        <Button onClick={createEvent} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Create event</Button>
      </Stack>

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

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);
    headers.append("Content-Type", "application/json");

    const body = {
      date: startDate,
      beginTime: startTime,
      endTime: endTime,
      gameId: gameId,
      description: description,
      eventType: eventType
    }

    if (Number(localStorage.getItem("jwsTtl")) < Date.now()) {
      let headersArray = new Array();
      headers.forEach((value, key) => {
        headersArray.push([key, value]);
      });
      cacheRequestAndRelog(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + "/backend/event/create"),
        "POST",
        JSON.stringify(body),
        headersArray,
        "Event created successfully"
      )
    } else {
      fetch(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + "/backend/event/create"),
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      })
      .then(async response => {
        if (response.ok) {
          toast({
            title: 'Event created successfully',
            status: 'success',
            duration: 5000,
            isClosable: true
          })
        } else {
          const data = await response.json();
          toast({
            title: 'Error',
            description: data.msg?? data.message?? 'Unknown error.',
            status: 'error',
            duration: 5000,
            isClosable: true
          })
        }
      })
      .catch(error => console.error("Error", error));
    }
  }
}
