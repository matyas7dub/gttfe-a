import { Button, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { cacheRequestAndRelog } from "../../../components/Navbar/Login/LoginScript";
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

        <DataPicker eventId={eventId?? undefined} dataType={dataType.stage} changeHandler={event => selectStage(Number(event.target.value))} />

        <DataPicker eventId={eventId?? undefined} stageId={stageId?? undefined} dataType={dataType.match} changeHandler={event => selectMatch(Number(event.target.value))} />

        <TeamResultInput isDisabled={matchId == undefined} stageId={stageId?? undefined}
          firstTeamId={firstTeamId} setFirstTeamId={setFirstTeamId} firstTeamResult={firstTeamResult} setFirstTeamResult={setFirstTeamResult}
          secondTeamId={secondTeamId} setSecondTeamId={setSecondTeamId} secondTeamResult={secondTeamResult} setSecondTeamResult={setSecondTeamResult} />

        <Button isDisabled={matchId == undefined} onClick={updateMatch} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Update match</Button>

      </Stack>
    </div>
  )

  function selectStage(newStageId: number) {
    setStageId(newStageId);
    if (eventId == undefined) {
      fetch(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/stage/${newStageId}/`),
      )
      .then(response => response.json())
      .then(data => setEventId(Number(data.eventId)))
      .catch(error => console.error("Error", error));
    }
  }

  function selectMatch(newMatchId: number) {
    setMatchId(newMatchId);
    if (stageId == undefined) {
      fetch(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/match/${newMatchId}/`),
      )
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
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);
    headers.append("Content-Type", "application/json");
    
    const body = {
      stageId: stageId,
      firstTeamId: firstTeamId,
      secondTeamId: secondTeamId,
      firstTeamResult: firstTeamResult,
      secondTeamResult: secondTeamResult
    }

    if (Number(localStorage.getItem("jwsTtl")) < Date.now()) {
      let headersArray = new Array();
      headers.forEach((value, key) => {
        headersArray.push([key, value]);
      });
      cacheRequestAndRelog(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/match/${matchId}/`),
        "PUT",
        JSON.stringify(body),
        headersArray,
        "Match updated successfully"
      )
    } else {
      fetch(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/match/${matchId}/`),
      {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(body)
      })
      .then(async response => {
        if (response.ok) {
          toast({
            title: 'Match updated successfully',
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
