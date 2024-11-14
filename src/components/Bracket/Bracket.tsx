import { RepeatIcon } from '@chakra-ui/icons';
import { Button, ColorMode, CreateToastFnReturn, Stack, useColorMode } from '@chakra-ui/react';
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

  let eventType = useRef(EventType.none);

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
    .then(data => {eventType.current = data.eventType})
    .catch(error => console.error("Error: ", error));

    getMatches(props.eventId, props.toast)
    .then(output => {
      setMatches(output);
      renderBracket(setBracket, output, width, height, colorMode, props.callback);
    })
  }

  useEffect(() => {
    if (props.eventId === 0 || eventType.current === EventType.none) {
      return;
    }

    renderBracket(setBracket, matches, width, height, colorMode, props.callback);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMode, width, height]);

  function renderBracket(setState: React.Dispatch<React.SetStateAction<JSX.Element>>, matches: MatchType[] | null, width: number | null, height: number | null, colorMode: ColorMode, callback: ((id: string) => void) | undefined) {
    console.debug(eventType.current);
    if (eventType.current === EventType.playoff && matches !== null) {
      setState(SingleElimination(matches, width, height, colorMode, callback));
    } else if (eventType.current.startsWith(EventType.swiss)) {
      setState(<div>swiss - TODO</div>);
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

async function getMatches(eventId: number, toast: CreateToastFnReturn): Promise<MatchType[] | null> {
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

  await fetchGracefully(backendUrl + `/backend/event/${eventId}/`, {}, null, toast)
  .then(response => response.json())
  .then(data => 
  fetchGracefully(backendUrl + `/backend/team/list/participating/${data.gameId}/false/`, {}, null, toast)
  .then(response => response.json())
  .then(teams => {
    for (let team of teams) {
      if (!teamNamesById.has(team.teamId)) {
        teamNamesById.set(team.teamId, team.name);
      }
    }
  }))
  .catch(error => console.error("Error: ", error));

  const stageCount = stageLevelsById.size;
  const totalStageCount = Math.ceil(Math.sqrt(teamNamesById.size));
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
  }

  return matches;
}
