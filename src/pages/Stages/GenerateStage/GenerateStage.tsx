import { CreateToastFnReturn, FormControl, FormLabel, Input, useToast } from "@chakra-ui/react";
import { useRef, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { EventType } from "../../../components/EventTypeSelector/EventTypeSelector";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function GenerateStage() {
  const [eventId, setEventId] = useState<number>();
  const [eventType, setEventType] = useState<EventType>(EventType.none);
  const gameId = useRef("");
  const [previousStageName, setPreviousStageName] = useState("");
  const [previousStageIndex, setPreviousStageIndex] = useState<number | null>(null);
  const [stageName, setStageName] = useState("");
  const [teamIds, setTeamIds] = useState<number[]>([]);

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} toast={toast}
          isDisabled={previousStageIndex !== null && eventType.startsWith(EventType.groups)}
          errorMessage={previousStageIndex !== null && eventType.startsWith(EventType.groups) ? "You cannot have any existing stages when creating a groups event" : undefined}/>

        <FormControl isDisabled={eventId == null}>
          <FormLabel>Stage name</FormLabel>
          <Input onChange={event => setStageName(event.target.value)} marginBottom="1rem"/>
          {previousStageIndex !== null ? `Stage ${previousStageIndex} was ${previousStageName}` : (eventId ? "No previous stage" : "")}
        </FormControl>

        <ConfirmationButton isDisabled={!stageName || (previousStageIndex !== null && eventType.startsWith(EventType.groups))} onClick={() => {createStage()}}>Create stage and matches</ConfirmationButton>
      </EndpointForm>
    </div>
  )

  async function selectEvent(newEventId: number) {
    setEventId(newEventId);
    let newEventType: EventType = EventType.none;

    await fetchGracefully(backendUrl + `/backend/event/${newEventId}`, {}, null, toast)
    .then(response => response.json())
    .then(data => {
      const tempEventType = data.eventType as EventType;
      setEventType(tempEventType);
      newEventType = tempEventType;
      gameId.current = data.gameId;
    })
    .catch(error => console.error("Error: ", error));

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
      setTeams(newEventId, newEventType);
    })
    .catch(error => console.error("Error", error));
  }

  function setTeams(eventId: number, eventType: EventType) {
    const teams: number[] = [];
    fetchGracefully(backendUrl + `/backend/team/list/participating/${gameId.current}/false/`, {}, null, toast)
    .then(response => response.json())
    .then(data => {
      for (let team of data) {
        if (!teams.includes(team.teamId)) {
          teams.push(team.teamId);
        }
      }
    })
    .then(() => {
      if (eventType === EventType.playoff) {
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
        })
      }
      setTeamIds(teams);
    })
    .catch(error => console.error("Error: ", error));
  }

  function createStage() {
    if (eventType === EventType.playoff || eventType.startsWith(EventType.swiss)) {
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
    } else if (eventType.startsWith(EventType.groups)) {
      // TODO: generate a stage for each group and call the fill function
    }
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
  
    if (Math.log2(teamIds.length).toString().includes(".") && (eventType === EventType.playoff || eventType.startsWith(EventType.swiss))) {
      toast({
        title: "Awkward team count",
        description: "A team won't play in this stage",
        status: "warning",
        duration: 5000,
        isClosable: true
      })
    }
  
    let matches: [number, number][] = new Array<[number, number]>();

    const tempTeamIds = teamIds;
    if (eventType === EventType.playoff && tempTeamIds.length % 2 !== 0) {
      // remove a random team that won't play this stage
      const randomIndex = Math.floor(Math.random() * tempTeamIds.length);
      tempTeamIds.splice(randomIndex, 1);

      for (let team = 0; team + 1 < tempTeamIds.length; team += 2) {
        matches.push([tempTeamIds[team], tempTeamIds[team + 1]]);
      }
  
    } else if (eventType.startsWith(EventType.swiss)) {
      const result = await getSwissMaps(eventId as number, toast);
      const scoreMap = result[0] as Map<number, number>;
      const opponentMap = result[1] as Map<number, number[]>;
      tempTeamIds.sort((a, b) => {
        const scoreA = scoreMap.get(a) ?? 0;
        const scoreB = scoreMap.get(b) ?? 0;

        return scoreB - scoreA; // descending order
      });

      if (tempTeamIds.length % 2 !== 0) {
        tempTeamIds.pop(); // worst team doesn't play and gets a free win
      }

      while (tempTeamIds.length !== 0) {
        let i = 1;
        const opponents = opponentMap.get(tempTeamIds[0]) ?? [];
        while (opponents.includes(tempTeamIds[i]) && i < tempTeamIds.length) {
          i++;
        }
        if (i >= tempTeamIds.length) {
          i = 1; // I am pretty sure this algorithm doesn't always guarantee non-repeating combinations, so here is a failsafe
        }
        matches.push([tempTeamIds[0], tempTeamIds[i]]);
        tempTeamIds.splice(0, 1);
        tempTeamIds.splice(i - 1, 1);
      }
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

async function getSwissMaps(eventId: number, toast: CreateToastFnReturn) {
  const scoreMap: Map<number, number> = new Map();
  const opponentMap: Map<number, number[]> = new Map();
  const playcountMap: Map<number, number> = new Map();
  let maxPlaycount = 0;

  await fetchGracefully(backendUrl + `/backend/event/${eventId}/matches/`, {}, null, toast)
  .then(response => response.json())
  .then(matches => {
    for (let match of matches) {
      const firstTeamId = match.firstTeamId;
      const secondTeamId = match.secondTeamId;
      const firstTeamPlaycount = playcountMap.get(firstTeamId)?? 0;
      const secondTeamPlaycount = playcountMap.get(secondTeamId)?? 0;
      const firstTeamOpponents = opponentMap.get(firstTeamId)?? [];
      const secondTeamOpponents = opponentMap.get(secondTeamId)?? [];


      if (firstTeamPlaycount + 1 > maxPlaycount) {
        maxPlaycount = firstTeamPlaycount + 1;
      } else if (secondTeamPlaycount + 1 > maxPlaycount) {
        maxPlaycount = secondTeamPlaycount + 1;
      }

      playcountMap.set(firstTeamId, firstTeamPlaycount + 1);
      playcountMap.set(secondTeamId, secondTeamPlaycount + 1);

      scoreMap.set(firstTeamId, match.firstTeamResult);
      scoreMap.set(secondTeamId, match.secondTeamResult);

      firstTeamOpponents.push(secondTeamId);
      opponentMap.set(firstTeamId, firstTeamOpponents);
      secondTeamOpponents.push(firstTeamId);
      opponentMap.set(secondTeamId, secondTeamOpponents);
    }
  })
  .catch(error => console.error("Error: ", error));

  const winPoints = 3;

  for (let teamId in playcountMap) {
    const playcount = playcountMap.get(Number(teamId))?? 0;

    if (playcount < maxPlaycount) {
      const score = scoreMap.get(Number(teamId))?? 0;
      scoreMap.set(Number(teamId), score + (maxPlaycount - playcount) * winPoints);
    }
  }

  return [scoreMap, opponentMap];
}
