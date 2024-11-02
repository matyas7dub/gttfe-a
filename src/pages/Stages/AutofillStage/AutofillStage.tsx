import { FormControl, FormLabel, Input, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { backendUrl } from "../../../config/config";
import { createStage } from "../../Events/AutofillEvent/AutofillEvent";

export default function AutofillStage() {
  const [eventId, setEventId] = useState<number>();
  const [previousStageName, setPreviousStageName] = useState("");
  const [previousStageIndex, setPreviousStageIndex] = useState(-1);
  const [stageName, setStageName] = useState("");
  const [teamIds, setTeamIds] = useState<number[]>();

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} />

        <FormControl isDisabled={eventId == null}>
          <FormLabel>Stage name</FormLabel>
          <Input onChange={event => setStageName(event.target.value)} marginBottom="1rem"/>
          {previousStageName !== "" ? `Stage ${previousStageIndex} was ${previousStageName}` : ""}
        </FormControl>

        <ConfirmationButton isDisabled={stageName === ""} onClick={createStageWrapper}>Create stage and matches</ConfirmationButton>
      </EndpointForm>
    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);
    fetch(backendUrl + `/backend/event/${newEventId}/stages/`,
    {
      headers: [["Authorization", `Bearer ${localStorage.getItem("jws")}`]]
    })
    .then(response => response.json())
    .then(stages => {
      let highestIndex = -1;
      for (let stage of stages) {
        if (stage.stageIndex > highestIndex) {
          highestIndex = stage.stageIndex;
          setPreviousStageName(stage.stageName);
          setPreviousStageIndex(stage.stageIndex);
        }
      }
      if (highestIndex === -1) {
        setPreviousStageName("");
        setPreviousStageIndex(-1);
      }
      getTeams(newEventId);
    })
    .catch(error => console.error("Error", error));
  }

  function createStageWrapper() {
    createStage(eventId as number, stageName, teamIds as number[], toast, previousStageIndex + 1);
  }

  function getTeams(eventId: number) {
    const teams: number[] = [];
    fetch(backendUrl + `/backend/event/${eventId}/`)
    .then(response => response.json())
    .then(data => fetch(backendUrl + `/backend/team/list/participating/${data.gameId}/false/`)
    .then(response => response.json())
    .then(data => {
      for (let team of data) {
        if (!teams.includes(team.teamId)) {
          teams.push(team.teamId);
        }
      }
    })
    .then(() => fetch(backendUrl + `/backend/event/${eventId}/matches/`,
    {
      headers: [["Authorization", `Bearer ${localStorage.getItem("jws")}`]]
    })
    .then(response => response.json())
    .then(matches => {
      for (let match of matches) {
        const firstTeam = teams.findIndex((id) => id === match.firstTeamId)
        const secondTeam = teams.findIndex((id) => id === match.secondTeamId)

        if (match.firstTeamResult > match.secondTeamResult && secondTeam !== -1) {
          teams.splice(secondTeam, 1);
        } else if (match.secondTeamResult > match.firstTeamResult && firstTeam !== -1) {
          teams.splice(firstTeam, 1);
        }
      }

      setTeamIds(teams);
    })))
  }
}
