import { Alert, AlertIcon, AlertTitle, CreateToastFnReturn, FormControl, FormLabel, Input, Stack, Tooltip, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";

export default function AutofillEvent() {
  const [eventId, setEventId] = useState<number>();
  const [stageName, setStageName] = useState("");
  const [teamIds, setTeamIds] = useState<any[]>();
  const [createdStage, setCreatedStage] = useState(false);
  const toast = useToast();
  return (
    <div>
      <Breadcrumbs />

      <Stack direction="column" spacing="3rem" className="Form">
        <Tooltip label="As this uses multiple requests, it is not *yet* implemented to automatically relog.">
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Make sure you are logged in!</AlertTitle>
          </Alert>
        </Tooltip>

        <DataPicker dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} />

        <FormControl isDisabled={eventId == null || createdStage}>
          <FormLabel>Stage name</FormLabel>
          <Input onChange={event => setStageName(event.target.value)}/>
        </FormControl>

        <ConfirmationButton isDisabled={stageName === "" || createdStage} onClick={createStage}>Create stage and matches</ConfirmationButton>
      </Stack>
    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);
    fetch(process.env.REACT_APP_BACKEND_URL + `/backend/event/${newEventId}/`)
    .then(response => response.json())
    .then(event => {
      // This returns the players, not the teams for some reason
      fetch(process.env.REACT_APP_BACKEND_URL + `/backend/team/list/participating/${event.gameId}/false/`)
      .then(response => response.json())
      .then(data => {
        let ids: number[] = [];
        for (let player of data) {
          if (!ids.includes(player.teamId)) {
            ids.push(player.teamId);
          }
        }
        setTeamIds(ids);
      })
      .catch(error => console.error("Error", error));
    })
    .catch(error => console.error("Error", error));
  }

  function createStage() {
    setCreatedStage(true);
    fetch(process.env.REACT_APP_BACKEND_URL + "/backend/stage/create",
      {
        method: "POST",
        body: JSON.stringify({
          eventId: eventId,
          stageName: stageName,
          stageIndex: 0
        }),
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jws")}`,
          "Content-Type": "application/json"
        }
      }
    )
    .then(async response => {
      if (response.ok) {
        toast({
          title: "Stage created successfully",
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        const stage = await response.json();
        autofillMatches(stage.stageId, teamIds as number[], toast);
      } else {
        toast({
          title: 'Error while creating the stage',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      }
    })
    .catch(error => console.error("Error", error));
  }
}

export function autofillMatches(stageId: number, teamIds: number[], toast: CreateToastFnReturn) {
  if (teamIds == null || teamIds.length === 0) {
    console.error("Teams array is empty!");
  } else {
    let matches: [number, number][] = new Array<[number, number]>();
    for (let team = 0; team + 1 < teamIds.length; team += 2) {
      matches.push([teamIds[team], teamIds[team + 1]]);
    }

    for (let match = 0; match < matches.length; match++) {
      fetch(process.env.REACT_APP_BACKEND_URL + "/backend/match/create/",
        {
          method: "POST",
          body: JSON.stringify({
            stageId: stageId,
            firstTeamId: matches[match][0],
            secondTeamId: matches[match][1],
            firstTeamResult: 0,
            secondTeamResult: 0
          }),
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jws")}`,
            "Content-Type": "application/json"
          }
        }
      )
      .then(response => {
        if (!response.ok) {
          toast({
            id: "matchErrorToast",
            title: 'Error while creating matches',
            description: `An error occured while creating match (teamId)${matches[match][0]} vs (teamId)${matches[match][1]}`,
            status: 'error',
            duration: 5000,
            isClosable: true
          })
        }
      })
      .then(() => {
        if (match === matches.length - 1 && !toast.isActive("matchErrorToast")) {
          toast({
            title: "Matches created successfully",
            status: 'success',
            duration: 5000,
            isClosable: true
          })
        }
      })
      .catch(error => console.error("Error", error));
    }
  }
}
