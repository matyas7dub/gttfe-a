import { RepeatIcon } from '@chakra-ui/icons';
import { Button, ColorMode, CreateToastFnReturn, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorMode } from '@chakra-ui/react';
import { SingleEliminationBracket, Match, SVGViewer, MatchType } from '@g-loot/react-tournament-brackets/dist/cjs';
import { useWindowSize } from '@uidotdev/usehooks';
import { useEffect, useRef, useState } from 'react';
import { backendUrl } from '../../config/config';
import theme from '../../theme';
import { EventType } from '../EventTypeSelector/EventTypeSelector';
import { fetchGracefully } from '../Navbar/Login/LoginScript';

type BracketProps = {
  eventId: number,
  toast: CreateToastFnReturn,
  callback?: (id: string) => void
}

export default function Bracket(props: BracketProps) {
  const [bracket, setBracket] = useState<JSX.Element>(<></>);
  const {width, height} = useWindowSize();
  const {colorMode}  = useColorMode();
  const [matches, setMatches] = useState<MatchType[] | null>(null);
  const [drawKey, setDrawKey] = useState(0);

  const eventType = useRef(EventType.none);
  const gameId = useRef(0);

  useEffect(() => {
    makeBracket();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.eventId, drawKey]);

  async function makeBracket(){
    if (props.eventId === 0) {
      return;
    }

    await fetchGracefully(backendUrl + `/backend/event/${props.eventId}/`, {}, null, props.toast)
    .then(response => response.json())
    .then(data => {
      eventType.current = data.eventType
      gameId.current = data.gameId;
    })
    .catch(error => console.error("Error: ", error));

    if (eventType.current === EventType.playoff) {
      getPlayoffMatches(props.eventId, gameId.current, props.toast)
      .then(output => {
        setMatches(output);
        renderBracket(setBracket, output, width, height, colorMode, props.callback);
      })
    } else if(eventType.current.startsWith(EventType.swiss)) {
      getSwissTable(props.eventId, gameId.current, props.toast, props.callback)
      .then(table => {
        setBracket(table);
      })
    }else if (eventType.current.startsWith(EventType.groups)) {
      getGroupsTables(props.eventId, gameId.current, props.toast, props.callback)
      .then(tables => {
        setBracket(tables);
      })
    } else {
      setBracket(<div>Invalid event type</div>);
    }
  }

  useEffect(() => {
    if (props.eventId === 0 || eventType.current === EventType.none) {
      return;
    }

    if (eventType.current === EventType.playoff) {
      renderBracket(setBracket, matches, width, height, colorMode, props.callback);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMode, width, height]);

  function renderBracket(setState: React.Dispatch<React.SetStateAction<JSX.Element>>, matches: MatchType[] | null, width: number | null, height: number | null, colorMode: ColorMode, callback: ((id: string) => void) | undefined) {
    if (eventType.current === EventType.playoff && matches !== null) {
      setState(SingleElimination(matches, width, height, colorMode, callback));
    } else if (eventType.current.startsWith(EventType.groups)) {
      setState(<div>groups - TODO</div>);
    } else {
      setState(<div>Error</div>);
    }
  }

  return (
    <div>
      <Stack direction="row">
      {bracket}
      {props.eventId !== 0 ? <Button onClick={() => {setDrawKey(drawKey + 1)}}><RepeatIcon /></Button> : <></>}
      </Stack>
    </div>
  );
}

const SingleElimination = (matches: MatchType[], width: number | null, height: number | null, colorMode: ColorMode, callback: ((id: string) => void) | undefined) => (
  <SingleEliminationBracket
    matches={matches}
    matchComponent={Match}
    svgWrapper={({ children, ...props }) => (
      <SVGViewer width={width !== null ? width * 0.8 : undefined} height={height !== null ? height * 0.6 : undefined}
       SVGBackground={colorMode === "light" ? "white" : theme.colors.GttBlue[100]} {...props}>
        {children}
      </SVGViewer>
    )}
    onMatchClick={callback !== undefined ?
    data => {
      callback(data.match.id as string);
    } :
    undefined}
  />
);

type cellData = {
  matchId: number,
  teamId: number,
  opponentId: number,
  score: number
}

async function getSwissTable(eventId: number, gameId: number, toast: CreateToastFnReturn, callback?: (id: string) => void) {
  const teamNameMap = await getTeamNames(gameId, toast);
  const cellsByStageLevel: cellData[][] = [];
  const stageIdsByLevel: Map<number, number> = new Map();
  const teamScoreMapByStageLevel: Map<number, number>[] = [];

  await fetchGracefully(backendUrl + `/backend/event/${eventId}/stages/`, {}, null, toast)
  .then(response => response.json())
  .then(stages => {
    for (let stage of stages) {
      stageIdsByLevel.set(stage.stageIndex, stage.stageId);
      cellsByStageLevel.push([]);
      teamScoreMapByStageLevel.push(new Map());
    }
  })

  await fetchGracefully(backendUrl + `/backend/event/${eventId}/matches/`, {}, null, toast)
  .then(response => response.json())
  .then(matches => {
    for (let stageLevel = 0; stageLevel < cellsByStageLevel.length; stageLevel++) {
      for (let match of matches) {
        if (match.stageIndex === stageLevel) {
          cellsByStageLevel[stageLevel].push({
            matchId: match.matchId,
            teamId: match.firstTeamId,
            opponentId: match.secondTeamId,
            score: 0
          });
          cellsByStageLevel[stageLevel].push({
            matchId: match.matchId,
            teamId: match.secondTeamId,
            opponentId: match.firstTeamId,
            score: 0
          })
          teamScoreMapByStageLevel[stageLevel].set(match.firstTeamId, match.firstTeamResult);
          teamScoreMapByStageLevel[stageLevel].set(match.secondTeamId, match.secondTeamResult);
        }
      }
    }
  })

  return await getTable(cellsByStageLevel, stageIdsByLevel, teamScoreMapByStageLevel, teamNameMap, callback);
}

async function getGroupsTables(eventId: number, gameId: number, toast: CreateToastFnReturn, callback?: (id: string) => void) {
  const tables: JSX.Element[] = [];

  const teamNameMap = await getTeamNames(gameId, toast);
  const groupMap: Map<string, any> = new Map();
  const groupLetters: string[] = [];

  await fetchGracefully(backendUrl + `/backend/event/${eventId}/stages/`, {}, null, toast)
  .then(response => response.json())
  .then(stages => {
    for (let stage of stages) {
      const regex = String(stage.stageName).match(/[A-Z]+ - \d+/);
      const groupLetter: string = regex !== null? regex[0].toString().substring(0, regex[0].toString().indexOf(" - ")) : "error";

      if (!groupMap.has(groupLetter)) {
        groupLetters.push(groupLetter);
      }

      const group = groupMap.get(groupLetter)?? [];
      group.push(stage);
      groupMap.set(groupLetter, group);
    }
  })

  for (let group = 0; group < groupLetters.length; group++) {
    const groupLetter = groupLetters[group];
    const cellsByStageLevel: cellData[][] = [];
    const stageIdsByLevel: Map<number, number> = new Map();
    const teamScoreMapByStageLevel: Map<number, number>[] = [];

    for (let stage of groupMap.get(groupLetter)) {
      stageIdsByLevel.set(stage.stageIndex, stage.stageId);
      cellsByStageLevel.push([]);
      teamScoreMapByStageLevel.push(new Map());
    }

    await fetchGracefully(backendUrl + `/backend/event/${eventId}/matches/`, {}, null, toast)
    .then(response => response.json())
    .then(matches => {
      for (let stageLevel = 0; stageLevel < cellsByStageLevel.length; stageLevel++) {
        for (let match of matches) {
          if (match.stageIndex === stageLevel) {
            cellsByStageLevel[stageLevel].push({
              matchId: match.matchId,
              teamId: match.firstTeamId,
              opponentId: match.secondTeamId,
              score: 0
            });
            cellsByStageLevel[stageLevel].push({
              matchId: match.matchId,
              teamId: match.secondTeamId,
              opponentId: match.firstTeamId,
              score: 0
            })
            teamScoreMapByStageLevel[stageLevel].set(match.firstTeamId, match.firstTeamResult);
            teamScoreMapByStageLevel[stageLevel].set(match.secondTeamId, match.secondTeamResult);
          }
        }
      }
    })

    tables.push(
      <Stack direction="column">
        <p>Group {groupLetter}</p>
        {await getTable(cellsByStageLevel, stageIdsByLevel, teamScoreMapByStageLevel, teamNameMap, callback)}
      </Stack>
    );
  }

  return (
    <Stack direction="column">
      {tables}
    </Stack>
  )
}

async function getTeamNames(gameId: number, toast: CreateToastFnReturn) {
  const teamNameMap: Map<number, string> = new Map();
  await fetchGracefully(backendUrl + `/backend/team/list/participating/${gameId}/false/`, {}, null, toast)
  .then(response => response.json())
  .then(teams => {
    for (let team of teams) {
      if (!teamNameMap.has(team.teamId)) {
        teamNameMap.set(team.teamId, team.name);
      }
    }
  })
  return teamNameMap;
}

async function getTable(cellsByStageLevel: cellData[][], stageIdsByLevel: Map<number, number>, teamScoreMapByStageLevel: Map<number, number>[], teamNameMap: Map<number, string>, callback?: (id: string) => void) {
  const globalScore: Map<number, number> = new Map();
  for (let stageLevel = 0; stageLevel < cellsByStageLevel.length; stageLevel++) {
    const stageMap: Map<number, number> = teamScoreMapByStageLevel[stageLevel]?? (new Map<number, number>()) as Map<number, number>;
    for (let cell of cellsByStageLevel[stageLevel]) {
      const teamScore = globalScore.get(cell.teamId)?? 0;
      const stageScore = stageMap.get(cell.teamId)?? 0;
      const score = teamScore + stageScore;
      globalScore.set(cell.teamId, score);
      cell.score = score;
    }
  }

  const tableHead = [];
  const table = [];
  tableHead.push([<Th></Th>]);
  for (let round = 1; round <= cellsByStageLevel.length; round++) {
    tableHead[0].push(<Th>{`Round ${round}`}</Th>);
  }
  cellsByStageLevel[0].sort((a, b) => {return a.teamId - b.teamId})

  const teamRowMap: Map<number, number> = new Map();

  for (let cell of cellsByStageLevel[0]) {
    const row = table.push([<Td>{teamNameMap.get(cell.teamId)}</Td>]) - 1;
    teamRowMap.set(cell.teamId, row);
    table[row].push(<Td cursor={callback ? "pointer" : undefined} onClick={callback ? () => callback(String(cell.matchId)) : undefined}>{`vs. ${teamNameMap.get(cell.opponentId)} (${cell.score})`}</Td>);
  }

  for (let stageLevel = 1; stageLevel < cellsByStageLevel.length; stageLevel++) {
    for (let cell of cellsByStageLevel[stageLevel]) {
      table[teamRowMap.get(cell.teamId)?? -1].push(<Td cursor={callback ? "pointer" : undefined}
      onClick={callback ? () => callback(String(cell.matchId)) : undefined}>{`vs. ${teamNameMap.get(cell.opponentId)} (${cell.score})`}</Td>);
    }
  }

  const rows: JSX.Element[] = [];
  for (let row = 0; row < table.length; row++) {
    rows.push(<Tr>{table[row]}</Tr>)
  }

  return (
    <TableContainer>
      <Table variant="striped">
        <Thead><Tr>{tableHead}</Tr></Thead>
        <Tbody>{rows}</Tbody>
      </Table>
    </TableContainer>
  )
}

async function getPlayoffMatches(eventId: number, gameId: number, toast: CreateToastFnReturn): Promise<MatchType[] | null> {
  // this heavily assumes that no 2 stages have the same index/level
  
  const matches: MatchType[] = [];

  const stageLevelsById: Map<number, number> = new Map();
  const stageIdsByLevel: Map<number, number> = new Map();
  let maxStageLevel = 0;
  let invalidStages = false;

  await fetchGracefully(backendUrl + `/backend/event/${eventId}/stages/`, {}, null, toast)
  .then(response => response.json())
  .then(stages => {
    for (let stage of stages) {
      stageLevelsById.set(stage.stageId, stage.stageIndex);
      if (stageIdsByLevel.has(stage.stageIndex)) {
        invalidStages = true;
      }
      stageIdsByLevel.set(stage.stageIndex, stage.stageId)
      if (stage.stageIndex > maxStageLevel) {
        maxStageLevel = stage.stageIndex;
      }
    }
  })
  .catch(error => console.error("Error: ", error));

  if (invalidStages) {
    return null;
  }

  const teamNamesById: Map<number, string> = new Map();

  await fetchGracefully(backendUrl + `/backend/team/list/participating/${gameId}/false/`, {}, null, toast)
  .then(response => response.json())
  .then(teams => {
    for (let team of teams) {
      if (!teamNamesById.has(team.teamId)) {
        teamNamesById.set(team.teamId, team.name);
      }
    }
  })
  .catch(error => console.error("Error: ", error));

  const stageCount = stageLevelsById.size;
  const totalStageCount = Math.ceil(Math.log2(teamNamesById.size));
  let fakeMatchCount = 1;
  let previousFakeIds = [-fakeMatchCount];
  if (stageCount !== totalStageCount) {
    matches.push({
      id: -fakeMatchCount, // negative, so they don't meet with real matches
      nextMatchId: null,
      startTime: "",
      state: "",
      participants: []
    });
    fakeMatchCount++;
  }

  for (let stage = totalStageCount - 1; stage > stageCount; stage--) {
    const fakeIdsBuffer = [];
    const matchCount = Math.pow(2, totalStageCount - stage);
    for (let match = 0; match < matchCount; match++) {
      fakeIdsBuffer.push(-fakeMatchCount);
      matches.push({
        id: -fakeMatchCount,
        nextMatchId: previousFakeIds[Math.floor(match/2)],
        startTime: "",
        state: "",
        participants: []
      });
      fakeMatchCount++;
    }
    previousFakeIds = fakeIdsBuffer;
  }

  const matchIndexesByStage: Map<number, number[]> = new Map();

  await fetchGracefully(backendUrl + `/backend/event/${eventId}/matches/`, {}, null, toast)
  .then(response => response.json())
  .then(data => {
    for (let match of data) {
      const matchIndexes = matchIndexesByStage.get(match.stageId)?? [];
      matchIndexes.push(matches.length);
      matchIndexesByStage.set(match.stageId, matchIndexes);

      matches.push({
        id: match.matchId,
        nextMatchId: -1,
        startTime: "",
        state: "",
        participants: [{
          id: match.firstTeamId,
          name: teamNamesById.get(match.firstTeamId),
          resultText: String(match.firstTeamResult)
        }, {
          id: match.secondTeamId,
          name: teamNamesById.get(match.secondTeamId),
          resultText: String(match.secondTeamResult)
        }]
      })
    }
  })

  const nextTeamMatch: Map<string | number, string | number> = new Map();

  const matchIndexes = matchIndexesByStage.get(stageIdsByLevel.get(maxStageLevel)?? -1)?? [];
  for (let match = 0; match < matchIndexes.length; match++) {
    const thisMatch = matches[matchIndexes[match]];
    thisMatch.nextMatchId = stageCount !== totalStageCount ? previousFakeIds[Math.floor(match/2)] : null;
    nextTeamMatch.set(thisMatch.participants[0].id, thisMatch.id);
    nextTeamMatch.set(thisMatch.participants[1].id, thisMatch.id);
  }

  fakeMatchCount = addFakeMatches(matches, previousFakeIds, maxStageLevel, matchIndexes.length, fakeMatchCount, teamNamesById.size)

  for (let stageLevel = maxStageLevel - 1; stageLevel >= 0; stageLevel--) {
    const matchIndexes = matchIndexesByStage.get(stageIdsByLevel.get(stageLevel)?? -1)?? [];

    for (let match = 0; match < matchIndexes.length; match++) {
      const thisMatch = matches[matchIndexes[match]];
      const firstTeam = thisMatch.participants[0].id;
      const secondTeam = thisMatch.participants[1].id;
      const nextMatchId =
      nextTeamMatch.has(firstTeam) ?
      nextTeamMatch.get(firstTeam)?? -1 :
      nextTeamMatch.has(secondTeam) ?
      nextTeamMatch.get(secondTeam)?? -1 :
      -1;
      if (nextMatchId === -1) {
        console.debug(nextTeamMatch);
        console.error(`Couldn't get next match id for match: ${thisMatch.id} for teams: ${firstTeam} and ${secondTeam}`);
      }
      thisMatch.nextMatchId = nextMatchId;
      nextTeamMatch.set(firstTeam, thisMatch.id);
      nextTeamMatch.set(secondTeam, thisMatch.id);
    }

    fakeMatchCount = addFakeMatches(matches, previousFakeIds, stageLevel, matchIndexes.length, fakeMatchCount, teamNamesById.size)
  }

  return matches;
}

function addFakeMatches(matches: MatchType[], previousFakeIds: number[], stageLevel: number, realMatchCount: number, fakeMatchCount: number, teamCount: number) {
  const stageMatchCount = Math.pow(2, Math.ceil(Math.log2(teamCount)) - (stageLevel + 1));
  for (let fakeMatch = 0; fakeMatch + realMatchCount < stageMatchCount; fakeMatch++) {
    matches.push({
      id: -fakeMatchCount,
      nextMatchId: previousFakeIds[Math.floor(fakeMatch/2)],
      startTime: "",
      state: "",
      participants: []
    });
    fakeMatchCount++;
  }
  return fakeMatchCount;
}
