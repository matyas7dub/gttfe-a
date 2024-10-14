import { FormControl, FormLabel, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function UpdateEvent() {
  const horizontalFormSpacing = "2rem";

  const [gameId, setGameId] = useState(0);
  const [eventId, setEventId] = useState<number>();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventPickerKey, setEventPickerKey] = useState(1); // this causes an upate on the event picker so that description changes show

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="column" spacing="3rem" className="Form">
        <DataPicker dataType={dataType.event} key={eventPickerKey} value={eventId?? 0} changeHandler={event => selectEvent(Number(event.target.value))} />

        <DataPicker dataType={dataType.game} isDisabled={eventId == null || eventId === 0} value={gameId} changeHandler={event => setGameId(Number(event.target.value))} />

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Start time</FormLabel>
            <Input isDisabled={eventId == null || eventId === 0} value={start} type="datetime-local" onChange={(event) => {setStart(event.target.value)}} />
          </FormControl>

          <FormControl>
            <FormLabel>End time</FormLabel>
            <Input isDisabled={eventId == null || eventId === 0} value={end} type="time" onChange={(event) => {setEnd(event.target.value)}} />
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input isDisabled={eventId == null || eventId === 0} value={description} type="text" placeholder="This should be a descriptive name" onChange={(event) => {setDescription(event.target.value)}} />
        </FormControl>

        <FormControl>
          <FormLabel>Event type</FormLabel>
          <Input isDisabled={eventId == null || eventId === 0} value={eventType} type="text" onChange={(event) => {setEventType(event.target.value)}} />
        </FormControl>

        <ConfirmationButton isDisabled={eventId == null || eventId === 0} onClick={updateEvent}>Update event</ConfirmationButton>
      </Stack>

    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);

    fetch(backendUrl + `/backend/event/${newEventId}/`)
    .then(response => response.json())
    .then(data => {
      const beginTimeTruncated = String(data.beginTime).substring(0, 5);
      const endTimeTruncated = String(data.endTime).substring(0, 5);
      setStart(`${data.date} ${beginTimeTruncated}`);
      setEnd(endTimeTruncated);
      setDescription(data.description);
      setEventType(data.eventType);
      setGameId(data.gameId);
    })
    .catch(error => console.error("Error", error));
  }

  function updateEvent() {
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

    fetchGracefully(backendUrl + `/backend/event/${eventId}/`,
    "PUT", JSON.stringify(body), headers, "Event updated successfully", toast);

    setEventPickerKey(eventPickerKey + 1);
  }
}
