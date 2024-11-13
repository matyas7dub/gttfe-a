import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import Bracket from "../../../components/Bracket/Bracket";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";

export default function EventBracket() {
  const toast = useToast();
  const [eventId, setEventId] = useState(0);

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker dataType={dataType.event} value={eventId} changeHandler={event => setEventId(Number(event.target.value))} toast={toast} />

        <Bracket eventId={eventId} toast={toast} />
      </EndpointForm>
    </div>
  )
}
