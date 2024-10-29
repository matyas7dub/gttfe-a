import { CreateToastFnReturn, FormControl, FormLabel, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

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
    fetch(backendUrl + `/backend/event/${newEventId}/`)
    .then(response => response.json())
    .then(event => {
      // This returns the players, not the teams for some reason
      fetch(backendUrl + `/backend/team/list/participating/${event.gameId}/false/`)
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
    fetchGracefully(backendUrl + "/backend/stage/create",
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
      },
      "Created stage successfully", toast)
    .then(async response => {
      if (response.ok) {
        const stage = await response.json();
        autofillMatches(stage.stageId, teamIds as number[], toast);
      }
    })
    .catch(error => console.error("Error", error));
  }
}

export function autofillMatches(stageId: number, teamIds: number[], toast: CreateToastFnReturn) {
  if (teamIds == null || teamIds.length < 2) {
    console.error("Not enough teams!");
    toast({
      title: "Not enough teams",
      description: "There isn't enough teams to create matches.",
      status: "error",
      duration: 5000,
      isClosable: true
    })
    return;
  }

  if (teamIds.length % 2 !== 0) {
    toast({
      title: "Odd team count",
      description: "Some team won't play in the first stage.",
      status: "warning",
      duration: 5000,
      isClosable: true
    })
  }

  let matches: [number, number][] = new Array<[number, number]>();
  for (let team = 0; team + 1 < teamIds.length; team += 2) {
    matches.push([teamIds[team], teamIds[team + 1]]);
  }

  for (let match = 0; match < matches.length; match++) {
    fetchGracefully(backendUrl + "/backend/match/create/",
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
      }, null, toast)
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
