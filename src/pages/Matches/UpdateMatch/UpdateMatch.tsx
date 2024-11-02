import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";
import TeamResultInput from "../TeamResultInput";

export default function UpdateMatch() {
  const toast = useToast();

  const [eventId, setEventId] = useState<number>();
  const [stageId, setStageId] = useState<number>();
  const [matchId, setMatchId] = useState<number>();

  const [firstTeamId, setFirstTeamId] = useState<number>();
  const [firstTeamResult, setFirstTeamResult] = useState<number>();
  const [secondTeamId, setSecondTeamId] = useState<number>();
  const [secondTeamResult, setSecondTeamResult] = useState<number>();
  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker value={eventId} dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} />

        <DataPicker value={stageId} options={{eventId: eventId?? undefined}} dataType={dataType.stage} changeHandler={event => selectStage(Number(event.target.value))} />

        <DataPicker value={matchId} options={{eventId: eventId?? undefined, stageId: stageId?? undefined}} dataType={dataType.match} changeHandler={event => selectMatch(Number(event.target.value))} />

        <TeamResultInput isDisabled={!matchId} stageId={stageId?? undefined}
          firstTeamId={firstTeamId} setFirstTeamId={setFirstTeamId} firstTeamResult={firstTeamResult} setFirstTeamResult={setFirstTeamResult}
          secondTeamId={secondTeamId} setSecondTeamId={setSecondTeamId} secondTeamResult={secondTeamResult} setSecondTeamResult={setSecondTeamResult} />

        <ConfirmationButton isDisabled={!matchId} onClick={updateMatch}>Update match</ConfirmationButton>

      </EndpointForm>
    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);
    if (newEventId === 0) {
      setStageId(0);
      setMatchId(0);
    }
  }

  function selectStage(newStageId: number) {
    setStageId(newStageId);
    if (newStageId === 0) {
      setMatchId(0);
    }
    if (!eventId) {
      fetch(backendUrl + `/backend/stage/${newStageId}/`)
      .then(response => response.json())
      .then(data => setEventId(Number(data.eventId)))
      .catch(error => console.error("Error", error));
    }
  }

  function selectMatch(newMatchId: number) {
    setMatchId(newMatchId);

    fetch(backendUrl + `/backend/match/${newMatchId}/`)
    .then(response => response.json())
    .then(data => {
      selectStage(Number(data.stageId))
      setFirstTeamId(Number(data.firstTeamId))
      setFirstTeamResult(Number(data.firstTeamResult))
      setSecondTeamId(Number(data.secondTeamId))
      setSecondTeamResult(Number(data.secondTeamResult))
    })
    .catch(error => console.error("Error", error));
  }

  function updateMatch() {
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];
    
    const body = {
      stageId: stageId,
      firstTeamId: firstTeamId,
      secondTeamId: secondTeamId,
      firstTeamResult: firstTeamResult,
      secondTeamResult: secondTeamResult
    }

    fetchGracefully(backendUrl + `/backend/match/${matchId}/`,
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: headers
    },
    "Match updated successfully", toast);
  }
}
