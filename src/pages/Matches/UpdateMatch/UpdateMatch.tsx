import { Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
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

      <Stack direction="column" spacing="3rem" className="Form">
        <DataPicker dataType={dataType.event} changeHandler={event => setEventId(Number(event.target.value))} />

        <DataPicker options={{eventId: eventId?? undefined}} dataType={dataType.stage} changeHandler={event => selectStage(Number(event.target.value))} />

        <DataPicker options={{eventId: eventId?? undefined, stageId: stageId?? undefined}} dataType={dataType.match} changeHandler={event => selectMatch(Number(event.target.value))} />

        <TeamResultInput isDisabled={!matchId} stageId={stageId?? undefined}
          firstTeamId={firstTeamId} setFirstTeamId={setFirstTeamId} firstTeamResult={firstTeamResult} setFirstTeamResult={setFirstTeamResult}
          secondTeamId={secondTeamId} setSecondTeamId={setSecondTeamId} secondTeamResult={secondTeamResult} setSecondTeamResult={setSecondTeamResult} />

        <ConfirmationButton isDisabled={!matchId} onClick={updateMatch}>Update match</ConfirmationButton>

      </Stack>
    </div>
  )

  function selectStage(newStageId: number) {
    setStageId(newStageId);
    if (!eventId) {
      fetch(process.env.REACT_APP_BACKEND_URL + `/backend/stage/${newStageId}/`)
      .then(response => response.json())
      .then(data => setEventId(Number(data.eventId)))
      .catch(error => console.error("Error", error));
    }
  }

  function selectMatch(newMatchId: number) {
    setMatchId(newMatchId);
    if (!stageId) {
      fetch(process.env.REACT_APP_BACKEND_URL + `/backend/match/${newMatchId}/`)
      .then(response => response.json())
      .then(data => {
        setStageId(Number(data.stageId))
        setFirstTeamId(Number(data.firstTeamId))
        setFirstTeamResult(Number(data.firstTeamResult))
        setSecondTeamId(Number(data.secondTeamId))
        setSecondTeamResult(Number(data.secondTeamResult))
      })
      .catch(error => console.error("Error", error));
    }
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

    fetchGracefully(process.env.REACT_APP_BACKEND_URL + `/backend/match/${matchId}/`,
      "PUT", JSON.stringify(body), headers, "Match updated successfully", toast);
  }
}
