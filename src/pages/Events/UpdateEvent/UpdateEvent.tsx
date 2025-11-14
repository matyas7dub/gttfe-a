import { FormControl, FormLabel, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import EventTypeData, { parseEventType, stringifyEventType, SwissData } from "../../../components/EventTypeData/EventTypeData";
import EventTypeSelector, { EventType } from "../../../components/EventTypeSelector/EventTypeSelector";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl, horizontalFormSpacing } from "../../../config/config";

export default function UpdateEvent() {
  const [gameId, setGameId] = useState(0);
  const [eventId, setEventId] = useState<number>();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>(EventType.none);
  const [qualificationThreshold, setQualificationThreshold] = useState<number>();
  const [eventPickerKey, setEventPickerKey] = useState(1); // this causes an upate on the event picker so that description changes show

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker dataType={dataType.event} key={eventPickerKey} value={eventId?? 0} changeHandler={event => selectEvent(Number(event.target.value))} toast={toast} />

        <DataPicker dataType={dataType.game} isDisabled={eventId == null || eventId === 0} value={gameId} changeHandler={event => setGameId(Number(event.target.value))} toast={toast} />

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

        <EventTypeSelector isDisabled={eventId == null || eventId === 0} value={eventType} changeHandler={event => setEventType(event.target.value as EventType)} />
        <EventTypeData eventType={eventType} changeHandler={value => setEventTypeData(value)} />

        <ConfirmationButton isDisabled={eventId == null || eventId === 0} onClick={updateEvent}>Update event</ConfirmationButton>
      </EndpointForm>
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
      setGameId(data.gameId);
      const eventType = parseEventType(data.eventType);
      setEventType(eventType.type);
      if (eventType.type === EventType.swiss) {
        const swiss = eventType as SwissData;
        setQualificationThreshold(swiss.qualificationThreshold);
      }
    })
    .catch(error => console.error("Error", error));
  }

  function setEventTypeData(data: string) {
    const fullEventType = (eventType + data) as EventType;
    const parsed = parseEventType(fullEventType);
    if (parsed.type === EventType.swiss) {
      const swiss = parsed as SwissData;
      setQualificationThreshold(swiss.qualificationThreshold);
    }
  }

  function updateEvent() {
    const startTimestamp = Date.parse(start);
    const startDateObject = new Date(startTimestamp);
    const startDate = startDateObject.toISOString().split('T')[0].replace(/-/g, '-')

    const startHours = String(startDateObject.getHours()).length === 1 ? `0${startDateObject.getHours()}` : startDateObject.getHours();
    const startMinutes = String(startDateObject.getMinutes()).length === 1 ? `0${startDateObject.getMinutes()}` : startDateObject.getMinutes();
    const startTime = `${startHours}:${startMinutes}:00`;

    const endTime = `${end}:00`;

    const fullEventType = stringifyEventType(eventType, {qualificationThreshold});

    fetchGracefully(backendUrl + `/backend/event/${eventId}/`,
    {
      method: "PUT",
      body: JSON.stringify({
        date: startDate,
        beginTime: startTime,
        endTime: endTime,
        gameId: gameId,
        description: description,
        eventType: fullEventType
      }),
      headers: {"Content-Type": "application/json"}
    }, "Event updated successfully", toast);

    setEventPickerKey(eventPickerKey + 1);
  }
}
