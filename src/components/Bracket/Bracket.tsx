import { CreateToastFnReturn, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { backendUrl } from '../../config/config';
import { parseEventType } from '../EventTypeData/EventTypeData';
import { EventType } from '../EventTypeSelector/EventTypeSelector';
import { fetchGracefully } from '../Navbar/Login/LoginScript';

type BracketProps = {
  eventId: number,
  toast: CreateToastFnReturn,
  callback?: (id: number) => void
}

export default function Bracket(props: BracketProps) {
  const [bracket, setBracket] = useState<JSX.Element>(<></>);

  useEffect(() => {
    if (props.eventId === 0) {
      return;
    }

    renderBracket();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.eventId])

  return bracket;

  async function renderBracket() {
    let eventType = EventType.none;
    let gameId = 0;
    await fetchGracefully(backendUrl + `/backend/event/${props.eventId}/`, {}, null, props.toast)
    .then(response => response.json())
    .then(event => {
      eventType = event.eventType;
      gameId = event.gameId;
    })

    const namesMap = await getTeamNames(gameId, props.toast);

    eventType = parseEventType(eventType).type;
    if (eventType === EventType.playoff) {
      fetchGracefully(backendUrl + `/backend/event/${props.eventId}/matches/`, {}, null, props.toast)
      .then(response => response.json())
      .then(async (matches: Match[]) => setBracket(await universalTable(namesMap, matches, false, true, 0, props.callback)));
    } else if (eventType === EventType.swiss) {
      fetchGracefully(backendUrl + `/backend/event/${props.eventId}/matches/`, {}, null, props.toast)
      .then(response => response.json())
      .then(async (matches: Match[]) => setBracket(await universalTable(namesMap, matches, true, false, 3, props.callback)));
    } else if (eventType === EventType.groups) {
      const tables: JSX.Element[] = [];

      await fetchGracefully(backendUrl + `/backend/event/${props.eventId}/stages/`, {}, null, props.toast)
      .then(response => response.json())
      .then(async stages => {
        if (stages.length === 0) {
          tables.push(<p>No matches</p>);
          return;
        }
        const groupLetters = [];
        const stagesByGroup: Map<string, number[]> = new Map();
        for (let stage of stages) {
          const regex = String(stage.stageName).match(/[A-Z]+ - \d+/);
          const groupLetter: string = regex !== null? regex[0].toString().substring(0, regex[0].toString().indexOf(" - ")) : "error";
          if (!stagesByGroup.has(groupLetter)) {
            groupLetters.push(groupLetter);
          }
          const tempGroupStages = stagesByGroup.get(groupLetter)?? [];
          tempGroupStages.push(stage.stageId);
          stagesByGroup.set(groupLetter, tempGroupStages);
        }

        for (let groupIndex = 0; groupIndex < groupLetters.length; groupIndex++) {
          const group = groupLetters[groupIndex];

          const matches: Match[] = [];
          const stages = stagesByGroup.get(group)?? [];

          const promises = [];
          for (let stage of stages) {
            promises.push(fetchGracefully(backendUrl + `/backend/stage/${stage}/matches/`, {}, null, props.toast)
            .then(response => response.json())
            .then((data: Match[]) => {
              for (let match of data) {
                matches.push(match);
              }
            }))
          }
          await Promise.allSettled(promises);

          tables.push(<Stack direction="column"><p>Group {group}</p>{await universalTable(namesMap, matches, true, false, 0, props.callback)}</Stack>);
        }
      })

      setBracket(<Stack direction="column" spacing="1rem">{tables}</Stack>);
    } else if (eventType === EventType.none) {
      setBracket(<p>Error: malformed event type</p>);
    } else {
      setBracket(<p>Error</p>);
    }
  }
}

type Match = {
  matchId: number,
  firstTeamId: number,
  secondTeamId: number,
  firstTeamResult: number,
  secondTeamResult: number,
  stageId: number,
  stageIndex: number
}

async function getTeamNames(gameId: number, toast: CreateToastFnReturn) {
  const teamNameMap: Map<number, string> = new Map();
  await fetchGracefully(backendUrl + `/backend/team/list/participating/${gameId}/players/`, {}, null, toast)
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

async function universalTable(teamNames: Map<number, string>, matches: Match[], accumulateScore: boolean, eliminating: boolean, skipPoints: number, callback?: (id: number) => void) {
  if (matches.length === 0) {
    return <p>No matches</p>;
  }
  const teamRows: Map<number, number> = new Map();
  const stageMatchesByLevel: Map<number, Match[]> = new Map();
  const rows: JSX.Element[][] = [];
  const teamOnRow: number[] = [];

  for (let match of matches) {
    const stageMatchesBuffer = stageMatchesByLevel.get(match.stageIndex)?? [];
    stageMatchesBuffer.push(match);
    stageMatchesByLevel.set(match.stageIndex, stageMatchesBuffer);

    const addRow = (teamId: number) => {
      if(!teamRows.has(teamId)) {
        teamRows.set(teamId, teamRows.size);
        rows.push([<Td>{teamNames.get(teamId)?? "Unnamed"}</Td>])
        teamOnRow.push(teamId);
      }
    }
    addRow(match.firstTeamId);
    addRow(match.secondTeamId);
  }

  const scoreMap: Map<number, number> = new Map();
  const isEliminatedByRow: Map<number, boolean> = new Map();
  for (let stageLevel = 0; stageLevel < stageMatchesByLevel.size; stageLevel++) {
    const matches = stageMatchesByLevel.get(stageLevel)?? [];
    const eliminatedTeams = [];

    for (let match of matches) {
      const firstTeamRow = teamRows.get(match.firstTeamId)?? -1;
      const secondTeamRow = teamRows.get(match.secondTeamId)?? -1;

      const firstScore = match.firstTeamResult;
      const secondScore = match.secondTeamResult;

      if (eliminating) {
        if (firstScore > secondScore) {
          eliminatedTeams.push(match.secondTeamId);
        } else if (secondScore > firstScore) {
          eliminatedTeams.push(match.firstTeamId);
        }
      }

      if (accumulateScore) {
        const firstScoreTemp = scoreMap.get(match.firstTeamId)?? 0;
        const secondScoreTemp = scoreMap.get(match.secondTeamId)?? 0;
        scoreMap.set(match.firstTeamId, firstScore + firstScoreTemp);
        scoreMap.set(match.secondTeamId, secondScore + secondScoreTemp);
      }

      rows[firstTeamRow].push(<Td cursor={callback ? "pointer" : undefined} onClick={callback ? () => {callback(match.matchId)} : undefined}
        >{`vs. ${teamNames.get(match.secondTeamId)?? "Unnamed"} ${accumulateScore ? scoreMap.get(match.firstTeamId) : firstScore}`}</Td>);
      rows[secondTeamRow].push(<Td cursor={callback ? "pointer" : undefined} onClick={callback? () => {callback(match.matchId)} : undefined}
        >{`vs. ${teamNames.get(match.firstTeamId)?? "Unnamed"} ${accumulateScore ? scoreMap.get(match.secondTeamId) : secondScore}`}</Td>);
    }

    for (let row = 0; row < rows.length; row++) {
      const expectedLength = 1 + stageLevel + 1;
      if (rows[row].length < expectedLength) {
        if (isEliminatedByRow.get(row)) {
          rows[row].push(<Td></Td>);
        } else {
          rows[row].push(<Td>Skip</Td>);
          const skippedTeamScore = scoreMap.get(teamOnRow[row]) ?? 0;
          scoreMap.set(teamOnRow[row], skippedTeamScore + skipPoints);
        }
      }
    }

    for (let teamId of eliminatedTeams) {
      const teamRow = teamRows.get(teamId)?? -1;
      isEliminatedByRow.set(teamRow, true);
    }
  }

  const table: JSX.Element[] = [];
  const roundsHeader: JSX.Element[] = [];
  for (let round = 0; round < stageMatchesByLevel.size; round++) {
    roundsHeader.push(<Th>Round {round + 1}</Th>);
  }
  table.push(<Thead><Tr><Td></Td>{roundsHeader}</Tr></Thead>);

  const body: JSX.Element[] = [];
  for (let row of rows) {
    body.push(<Tr>{row}</Tr>);
  }
  table.push(<Tbody>{body}</Tbody>);

  return (
    <TableContainer marginTop="-1rem">
      <Table variant="striped">
        {table}
      </Table>
    </TableContainer>
  );
}
