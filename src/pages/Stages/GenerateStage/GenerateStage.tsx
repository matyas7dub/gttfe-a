import { CreateToastFnReturn, FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, useToast } from "@chakra-ui/react";
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
  const [groupSizes, setGroupSizes] = useState<number[]>([]);

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker dataType={dataType.event} changeHandler={event => selectEvent(Number(event.target.value))} toast={toast}
          isInvalid={previousStageIndex !== null && eventType.startsWith(EventType.groups)}
          errorMessage={previousStageIndex !== null && eventType.startsWith(EventType.groups) ? "You cannot have any existing stages when creating a groups event" : undefined} />

        <FormControl hidden={eventId == null || eventType.startsWith("groups")}>
          <FormLabel>Stage name</FormLabel>
          <Input value={stageName} onChange={event => setStageName(event.target.value)} marginBottom="1rem" />
          {previousStageIndex !== null ? `Stage ${previousStageIndex} was ${previousStageName}` : (eventId ? "No previous stage" : "")}
        </FormControl>

        <FormControl hidden={eventId == null || !eventType.startsWith("groups")}>
          <FormLabel>Group count</FormLabel>
          <NumberInput min={1} onChange={(_v, value) => changeGroupCounts(value)} value={groupSizes.length || undefined}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>

          {groupSizes.map((groupSize, i) => (
            <FormControl key={i} marginTop="0.5rem">
              <FormLabel>Group {getGroupName(i)} size</FormLabel>
              <NumberInput min={2} value={groupSize} onChange={(_, value) => setGroupSizes(prev => {
                const copy = [...prev];
                copy[i] = value;
                return copy;
              })}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          ))}
        </FormControl>

        <ConfirmationButton
          isDisabled={
            (!stageName && !eventType.startsWith(EventType.groups)) ||
            (eventType.startsWith("groups") && (previousStageIndex !== null || groupSizes.length === 0 || groupSizes.reduce((acc, value) => acc += value) !== teamIds.length))
          }
          onClick={() => {createStage()}}
        >Create stage and matches</ConfirmationButton>
      </EndpointForm>
    </div>
  )

  async function selectEvent(newEventId: number) {
    setEventId(newEventId);
    let newEventType: EventType = EventType.none;

    await fetchGracefully(backendUrl + `/backend/event/${newEventId}`, {}, null, toast)
      .then(response => response.json())
      .then(data => {
        newEventType = data.eventType as EventType;
        setEventType(newEventType);
        gameId.current = data.gameId;
      })
      .catch(error => console.error("Error: ", error));

    if (newEventType.startsWith("groups")) {
      setStageName("");
    }

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

  async function setTeams(eventId: number, eventType: EventType) {
    let teams: number[] = [];
    await fetchGracefully(backendUrl + `/backend/team/list/participating/${gameId.current}/false/`, {}, null, toast)
      .then(response => response.json())
      .then(async data => {
        for (let team of data) {
          teams.push(team.teamId);
        }
        teams.sort((a, b) => a - b);
        teams = teams.filter((value, index, array) => index === 0 || array[index - 1] !== value);

        if (eventType === EventType.playoff) {
          await fetchGracefully(backendUrl + `/backend/event/${eventId}/matches/`, {}, null, toast)
            .then(response => response.json())
            .then(matches => {
              let eliminated: number[] = [];
              for (let match of matches as Match[]) {
                if (match.firstTeamId === match.secondTeamId) {
                  continue;
                }

                if (match.firstTeamResult > match.secondTeamResult) {
                  eliminated.push(match.secondTeamId);
                } else if (match.secondTeamResult > match.firstTeamResult) {
                  eliminated.push(match.firstTeamId);
                } else {
                  console.error(`Invalid state! Match ${match.firstTeamId} vs ${match.secondTeamId} is indeterminate`)
                }
              }
              eliminated.sort((a, b) => a - b);

              for (let i = 0; i < teams.length; i++) {
                if (eliminated.includes(teams[i])) {
                  teams.splice(i, 1);
                  i--;
                }
              }
            })
        }
      })
      .catch(error => console.error("Error: ", error));

    console.debug(teams);
    setTeamIds(teams);
  }

  function createStage() {
    if (eventType === EventType.playoff || eventType.startsWith(EventType.swiss)) {
      fetchGracefully(backendUrl + "/backend/stage/create",
        {
          method: "POST",
          body: JSON.stringify({
            eventId: eventId,
            stageName: stageName,
            stageIndex: previousStageIndex !== null ? previousStageIndex + 1 : 0
          }),
          headers: { "Content-Type": "application/json" }
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
      const tempTeamIds = teamIds;
      for (let group = 0; tempTeamIds.length !== 0; group++) {
        generateGroup(group, tempTeamIds.splice(0, groupSizes[group]));
      }
    }
  }

  function changeGroupCounts(groupCount: number) {
    if (!groupCount || groupCount < 1) {
      setGroupSizes([]);
      return;
    }

    setGroupSizes(prev => {
      const next: number[] = new Array<number>(groupCount);
      for (let i = 0; i < groupCount; i++) {
        next[i] = prev[i] ?? 2;
      }
      return next;
    });
  }

  async function generateGroup(groupIndex: number, teams: number[]) {
    const groupLetter = getGroupName(groupIndex);

    if (teams.length % 2 !== 0) {
      teams.push(-1);
    }

    const stageCount = teams.length - 1;
    const stages: number[] = [];
    const promises = [];
    for (let stage = 0; stage < stageCount; stage++) {
      promises.push(fetchGracefully(backendUrl + "/backend/stage/create",
        {
          method: "POST",
          body: JSON.stringify({
            eventId: eventId,
            stageName: `${groupLetter} - ${stage}`,
            stageIndex: stage
          }),
          headers: { "Content-Type": "application/json" }
        }, null, toast)
        .then(response => response.json())
        .then(data => {
          stages.push(data.stageId);
        }))
    }

    const stageMatches: [number, number][][] = [];
    for (let stage = 0; stage < stageCount; stage++) {
      stageMatches[stage] = [];
    }

    Promise.allSettled(promises)
      .then(() => {
        const teamIndexes: number[] = [];
        for (let i = 0; i < teams.length / 2; i++) {
          teamIndexes.push(i);
          teamIndexes.push(teams.length - i - 1);
        }
        const rotateIndexes = () => {
          for (let i = 1; i < teamIndexes.length; i++) {
            teamIndexes[i]--;
            if (teamIndexes[i] === 0) {
              teamIndexes[i] = teams.length - 1;
            }
          }
        }

        for (let stage = 0; stage < stageCount; stage++) {
          for (let i = 1; i < teamIndexes.length; i += 2) {
            if (teams[teamIndexes[i - 1]] !== -1 && teams[teamIndexes[i]] !== -1) {
              stageMatches[stage].push([teams[teamIndexes[i - 1]], teams[teamIndexes[i]]]);
            }
          }
          rotateIndexes();
        }

        let success = true;
        for (let stage = 0; stage < stageCount; stage++) {
          for (let match of stageMatches[stage]) {
            fetchGracefully(backendUrl + "/backend/match/create/",
              {
                method: "POST",
                body: JSON.stringify({
                  stageId: stages[stage],
                  firstTeamId: match[0],
                  secondTeamId: match[1],
                  firstTeamResult: 0,
                  secondTeamResult: 0
                }),
                headers: { "Content-Type": "application/json" }
              }, null, toast)
              // eslint-disable-next-line no-loop-func
              .then(response => {
                if (!response.ok) {
                  success = false;
                }
              })
          }
        }
        if (success) {
          toast({
            title: `Group ${groupLetter} created successfully`,
            status: 'success',
            duration: 5000,
            isClosable: true
          });
        }
      })
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

    if (Math.log2(teamIds.length).toString().includes(".") && eventType === EventType.playoff) {
      toast({
        title: "Awkward team count",
        description: "A team won't play in this stage",
        status: "warning",
        duration: 5000,
        isClosable: true
      })
    }

    let matches: [number, number][] = new Array<[number, number]>();

    let tempTeamIds = teamIds;

    if (eventType === EventType.playoff) {
      if (tempTeamIds.length % 2 !== 0) {
        // remove a random team that won't play this stage
        const randomIndex = Math.floor(Math.random() * tempTeamIds.length);
        matches.push([tempTeamIds[randomIndex], tempTeamIds[randomIndex]]);
        tempTeamIds.splice(randomIndex, 1);
      }

      tempTeamIds.sort((a, b) => a - b);

      for (let team = 0; team + 1 < tempTeamIds.length; team += 2) {
        matches.push([tempTeamIds[team], tempTeamIds[team + 1]]);
      }

    } else if (eventType.startsWith(EventType.swiss)) {
      // TODO: display an error if the event type is malformed instead of defaulting to 3
      const threshold = Number(eventType.slice("swiss,".length) ?? 3) ?? 3;
      const result = await getSwissMaps(Number(gameId.current), eventId as number, toast);
      const scoreMap = result[0] as Map<number, Score>;
      const opponentMap = result[1] as Map<number, number[]>;
      tempTeamIds = tempTeamIds.filter(team => {
        const score = scoreMap.get(team) ?? { wins: 0, losses: 0 };
        if (score.wins < threshold && score.losses < threshold) {
          return true;
        } else {
          return false;
        }
      });
      tempTeamIds.sort((a, b) => {
        const scoreA = scoreMap.get(a) ?? { wins: 0, losses: 0 };
        const scoreB = scoreMap.get(b) ?? { wins: 0, losses: 0 };

        return scoreB.wins - scoreA.wins; // descending order
      });

      if (tempTeamIds.length % 2 !== 0) {
        tempTeamIds.pop(); // worst team doesn't play and gets a free win
      }

      const pairTeams = (unpairedTeams: number[], matches: [number, number][]): [number, number][] | null => {
        if (unpairedTeams.length === 0) {
          return matches;
        }
        // the unpaired teams need to be cloned to be able to go back in the recursion branches
        const unpairedTemp: number[] = structuredClone(unpairedTeams);

        const firstTeam = unpairedTemp.pop() as number;
        const opponents = opponentMap.get(firstTeam) ?? [];
        let i = unpairedTemp.length - 1;
        while (true) {
          while (opponents.includes(unpairedTemp[i]) && i >= 0) {
            i--;
          }
          if (i < 0) {
            return null;
          }
          const secondTeam = unpairedTemp[i];

          // copying here for the same reason
          const matchesTemp = structuredClone(matches);
          matchesTemp.push([firstTeam, secondTeam]);
          const unpairedTempTemp: number[] = structuredClone(unpairedTemp);
          unpairedTempTemp.splice(i, 1);

          const newMatches: [number, number][] | null = pairTeams(unpairedTempTemp, matchesTemp);
          if (newMatches === null) {
            i--;
            continue;
          } else {
            return newMatches;
          }
        }
      }

      const response = pairTeams(tempTeamIds, []);
      if (response === null) {
        matches = [];
        toast({
          title: "Couldn't pair teams",
          status: "error",
          duration: 5000,
          isClosable: true
        })
      } else {
        matches = response;
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
          headers: { "Content-Type": "application/json" }
        }, null, toast)
        // eslint-disable-next-line no-loop-func
        .then(response => {
          if (!response.ok) {
            success = false;
          }
        })
        .catch(error => console.error("Error", error));
    }
    if (success && matches.length !== 0) {
      toast({
        title: "Matches created successfully",
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    }
  }
}

type Score = {
  wins: number;
  losses: number;
};

type Match = {
  firstTeamId: number;
  secondTeamId: number;
  firstTeamResult: number;
  secondTeamResult: number;
};

async function getSwissMaps(gameId: number, eventId: number, toast: CreateToastFnReturn) {
  const scoreMap: Map<number, Score> = new Map();
  const opponentMap: Map<number, number[]> = new Map();
  const playcountMap: Map<number, number> = new Map();
  let maxPlaycount = 0;

  await fetchGracefully(backendUrl + `/backend/event/${eventId}/matches/`, {}, null, toast)
    .then(response => response.json())
    .then(matches => {
      for (let match of matches as Match[]) {
        const firstTeamId = match.firstTeamId;
        const secondTeamId = match.secondTeamId;
        const firstTeamScore = scoreMap.get(firstTeamId) ?? { wins: 0, losses: 0 };
        const secondTeamScore = scoreMap.get(secondTeamId) ?? { wins: 0, losses: 0 };
        const firstTeamOpponents = opponentMap.get(firstTeamId) ?? [];
        const secondTeamOpponents = opponentMap.get(secondTeamId) ?? [];
        const firstTeamPlaycount = playcountMap.get(firstTeamId) ?? 0;
        const secondTeamPlaycount = playcountMap.get(secondTeamId) ?? 0;

        if (firstTeamPlaycount + 1 > maxPlaycount) {
          maxPlaycount = firstTeamPlaycount + 1;
        } else if (secondTeamPlaycount + 1 > maxPlaycount) {
          maxPlaycount = secondTeamPlaycount + 1;
        }

        playcountMap.set(firstTeamId, firstTeamPlaycount + 1);
        playcountMap.set(secondTeamId, secondTeamPlaycount + 1);

        if (match.firstTeamResult > match.secondTeamResult) {
          scoreMap.set(firstTeamId, {
            wins: firstTeamScore.wins + 1,
            losses: firstTeamScore.losses,
          });

          scoreMap.set(secondTeamId, {
            wins: secondTeamScore.wins,
            losses: secondTeamScore.losses + 1
          });
        } else if (match.secondTeamResult > match.firstTeamResult) {
          scoreMap.set(secondTeamId, {
            wins: secondTeamScore.wins + 1,
            losses: secondTeamScore.losses
          });

          scoreMap.set(firstTeamId, {
            wins: firstTeamScore.wins,
            losses: firstTeamScore.losses + 1,
          });
        }

        firstTeamOpponents.push(secondTeamId);
        opponentMap.set(firstTeamId, firstTeamOpponents);
        secondTeamOpponents.push(firstTeamId);
        opponentMap.set(secondTeamId, secondTeamOpponents);
      }
    });

  const teams: number[] = [];
  await fetchGracefully(backendUrl + `/backend/team/list/participating/${gameId}/false/`, {}, null, toast)
    .then(response => response.json())
    .then(data => {
      for (let team of data) {
        if (!teams.includes(team.teamId)) {
          teams.push(team.teamId);
        }
      }
    })

  for (let team of teams) {
    const playcount = playcountMap.get(Number(team)) ?? 0;

    if (playcount < maxPlaycount) {
      const score = scoreMap.get(Number(team)) ?? { wins: 0, losses: 0 };
      scoreMap.set(Number(team), {
        wins: score.wins + (maxPlaycount - playcount),
        losses: score.losses
      });
    }
  }

  return [scoreMap, opponentMap];
}

function getGroupName(groupIndex: number) {
  let name = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  while (groupIndex >= 0) {
    const letterIndex = groupIndex % alphabet.length;
    name = alphabet[letterIndex] + name;
    groupIndex -= letterIndex;
    groupIndex /= alphabet.length;
    groupIndex--;
  }

  return name;
}
