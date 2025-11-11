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

  const [eventId, setEventId] = useState(0);
  const [stageId, setStageId] = useState(0);
  const [matchId, setMatchId] = useState(0);

  const [firstTeamId, setFirstTeamId] = useState(0);
  const [firstTeamResult, setFirstTeamResult] = useState<number>();
  const [secondTeamId, setSecondTeamId] = useState(0);
  const [secondTeamResult, setSecondTeamResult] = useState<number>();
  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker value={eventId} dataType={dataType.event} changeHandler={event => selectEvent(event)} toast={toast} />

        <DataPicker value={stageId} eventId={eventId} dataType={dataType.stage} changeHandler={event => selectStage(event)} toast={toast} />

        <DataPicker value={matchId} eventId={eventId} stageId={stageId} dataType={dataType.match} changeHandler={event => selectMatch(event)} toast={toast} />

        <TeamResultInput isDisabled={!matchId} stageId={stageId} toast={toast}
          firstTeamId={firstTeamId} setFirstTeamId={setFirstTeamId} firstTeamResult={firstTeamResult} setFirstTeamResult={setFirstTeamResult}
          secondTeamId={secondTeamId} setSecondTeamId={setSecondTeamId} secondTeamResult={secondTeamResult} setSecondTeamResult={setSecondTeamResult} />

        <ConfirmationButton isDisabled={!matchId} onClick={updateMatch}>Update match</ConfirmationButton>

        {/* <Bracket eventId={eventId} toast={toast} callback={id => {selectMatchInternal(id)}} /> */}

      </EndpointForm>
    </div>
  )

  function selectEvent(event: React.ChangeEvent<HTMLSelectElement>) {
    const newEventId = Number(event.target.value);
    setEventId(newEventId);

    if (newEventId !== eventId || !newEventId) {
      setStageId(0);
      setMatchId(0);
    }
  }

  function selectStage(event: React.ChangeEvent<HTMLSelectElement>) {
    const newStageId = Number(event.target.value);
    setStageId(newStageId);
    inferEvent(newStageId);

    if (newStageId !== stageId || !newStageId) {
      setMatchId(0);
    }
  }

  function inferEvent(stage: number) {
    if (eventId === 0) {
      fetch(backendUrl + `/backend/stage/${stage}/`)
      .then(response => response.json())
      .then(data => setEventId(Number(data.eventId)))
      .catch(error => console.error("Error", error));
    }
  }

  function selectMatch(event: React.ChangeEvent<HTMLSelectElement>) {
    selectMatchInternal(Number(event.target.value));
  }

  function selectMatchInternal(newId: number) {
    const newMatchId = newId;
    setMatchId(newMatchId);

    if (!newMatchId) {
      return;
    }

    fetch(backendUrl + `/backend/match/${newMatchId}/`)
    .then(response => response.json())
    .then(data => {
      setStageId(Number(data.stageId));
      inferEvent(Number(data.stageId));
      setFirstTeamId(Number(data.firstTeamId));
      setFirstTeamResult(Number(data.firstTeamResult));
      setSecondTeamId(Number(data.secondTeamId));
      setSecondTeamResult(Number(data.secondTeamResult));
    })
    .catch(error => console.error("Error", error));
  }

  function updateMatch() {
    fetchGracefully(backendUrl + `/backend/match/${matchId}/`,
    {
      method: "PUT",
      body: JSON.stringify({
        stageId: stageId,
        firstTeamId: firstTeamId,
        secondTeamId: secondTeamId,
        firstTeamResult: firstTeamResult,
        secondTeamResult: secondTeamResult
      }),
      headers: {"Content-Type": "application/json"}
    },
    "Match updated successfully", toast);
  }
}
