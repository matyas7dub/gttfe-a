import { FormControl, FormLabel, Input, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function GenerateStage() {
  const [eventId, setEventId] = useState<number>();
  const [previousStageName, setPreviousStageName] = useState("");
  const [previousStageIndex, setPreviousStageIndex] = useState<number | null>();
  const [stageName, setStageName] = useState("");
  const [teamIds, setTeamIds] = useState<number[]>([]);

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} toast={toast} />

        <FormControl isDisabled={eventId == null}>
          <FormLabel>Stage name</FormLabel>
          <Input onChange={event => setStageName(event.target.value)} marginBottom="1rem"/>
          {previousStageName ? `Stage ${previousStageIndex} was ${previousStageName}` : (eventId ? "No previous stage" : "")}
        </FormControl>

        <ConfirmationButton isDisabled={!stageName} onClick={() => {createStage()}}>Create stage and matches</ConfirmationButton>
      </EndpointForm>
    </div>
  )

  function selectEvent(newEventId: number) {
    setEventId(newEventId);
    fetchGracefully(backendUrl + `/backend/event/${newEventId}/stages/`, {}, null, toast)
    .then(response => response.json())
    .then(stages => {
      if (stages.length !== 0) {
        let highestIndex: [number, string] = [-1, ""];
        for (let stage of stages) {
          if (stage.stageIndex > highestIndex[0]) {
            highestIndex[0] = stage.stageIndex;
            highestIndex[1] = stage.stageName;
          }
        }
        setPreviousStageIndex(highestIndex[0]);
        setPreviousStageName(highestIndex[1]);
      } else {
        setPreviousStageIndex(null);
        setPreviousStageName("");
      }
      setTeams(newEventId);
    })
    .catch(error => console.error("Error", error));
  }

  function setTeams(eventId: number) {
    const teams: number[] = [];
    fetchGracefully(backendUrl + `/backend/event/${eventId}/`, {}, null, toast)
    .then(response => response.json())
    .then(data =>
    fetchGracefully(backendUrl + `/backend/team/list/participating/${data.gameId}/false/`, {}, null, toast)
    .then(response => response.json())
    .then(data => {
      for (let team of data) {
        if (!teams.includes(team.teamId)) {
          teams.push(team.teamId);
        }
      }
    })
    .then(() =>
    fetchGracefully(backendUrl + `/backend/event/${eventId}/matches/`, {}, null, toast)
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

  function createStage() {
    fetchGracefully(backendUrl + "/backend/stage/create",
      {
        method: "POST",
        body: JSON.stringify({
          eventId: eventId,
          stageName: stageName,
          stageIndex: previousStageIndex ? previousStageIndex + 1 : 0
        }),
        headers: {"Content-Type": "application/json"}
      },
      "Created stage successfully", toast)
    .then(async response => {
      if (response.ok) {
        const stage = await response.json();
        autofillMatches(stage.stageId);
      }
    })
    .catch(error => console.error("Error", error));
  }

  async function autofillMatches(stageId: number) {
    if (teamIds.length < 2) {
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
  
    if (Math.log2(teamIds.length).toString().includes(".")) {
      toast({
        title: "Awkward team count",
        description: "Some teams won't play in some stages",
        status: "warning",
        duration: 5000,
        isClosable: true
      })
    }
  
    let matches: [number, number][] = new Array<[number, number]>();

    // remove a random team that won't play this stage
    const tempTeamIds = teamIds;
    if (tempTeamIds.length % 2 !== 0) {
      const randomIndex = Math.floor(Math.random() * tempTeamIds.length);
      tempTeamIds.splice(randomIndex, 1);
    }

    for (let team = 0; team + 1 < tempTeamIds.length; team += 2) {
      matches.push([tempTeamIds[team], tempTeamIds[team + 1]]);
    }
  
    let success = true;
    for (let match = 0; match < matches.length; match++) {
      await fetchGracefully(backendUrl + "/backend/match/create/",
        {
          method: "POST",
          body: JSON.stringify({
            stageId: stageId,
            firstTeamId: matches[match][0],
            secondTeamId: matches[match][1],
            firstTeamResult: 0,
            secondTeamResult: 0
          }),
          headers: {"Content-Type": "application/json"}
        }, null, toast)
      // eslint-disable-next-line no-loop-func
      .then(response => {
        if (!response.ok) {
          success = false;
        }
      })
      .catch(error => console.error("Error", error));
    }
    if (success) {
      toast({
        title: "Matches created successfully",
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    }
  }
}
