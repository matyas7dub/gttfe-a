import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control";
import { Select } from "@chakra-ui/select";
import { ChangeEventHandler, useState, useEffect } from "react";

type DataPickerProps = {
  dataType: dataType,
  isInvalid?: boolean,
  changeHandler: ChangeEventHandler<HTMLSelectElement>,
  placeholder?: string,
  title?: string,
  value?: number,
  isDisabled?: boolean,
  // optional props for some data types
  gameId?: Number,
  eventId?: Number,
  stageId?: Number
}

export enum dataType {
  game,
  event,
  stage,
  match,
  teams,
}

export default function DataPicker(props: DataPickerProps) {
  const [data, setData] = useState<JSX.Element[]>();

  // changes depending on data type
  const [formLabel, setFormLabel] = useState("Pick one");
  const [placeholder, setPlaceholder] = useState("Select one");
  const [errorMessage, setErrorMessage] = useState("You must select one!");

  useEffect(() => {
    const url = process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '';
    let location = "";
    let invalid = false;

    switch (props.dataType) {
      case dataType.game:
        location =  '/backend/game/all/';
        setFormLabel("Game");
        setPlaceholder("Select a game");
        setErrorMessage("You must select a game!");
        break;
      case dataType.event:
        location = '/backend/event/listAll';
        setFormLabel("Event");
        setPlaceholder("Select an event");
        setErrorMessage("You must select an event!");
        break;
      case dataType.stage:
        if (props.eventId == undefined) {
          location = "/backend/stage/listAll/";
        } else {
          location = `/backend/event/${props.eventId}/stages/`
        }
        setFormLabel("Stage");
        setPlaceholder("Select a stage");
        setErrorMessage("You must select a stage!");
        break;
      case dataType.match:
        if (props.stageId == undefined) {
          location = "/backend/match/listAll/";
        } else {
          location = `/backend/stage/${props.stageId}/matches/`;
        }
        setFormLabel("Match");
        setPlaceholder("Select a match");
        setErrorMessage("You must select a match!");
        break;
      case dataType.teams:
        if (props.gameId == undefined) {
          console.error("You need to provide a gameId for the teams data picker")
          invalid = true;
        }
        location = `/backend/team/list/participating/${props.gameId}/false/`
        setFormLabel("Team")
        setPlaceholder("Select a team");
        setErrorMessage("You must select a team!");
        break;
    }

    if (!invalid && !props.isDisabled) {
      fetch(url + location)
      .then(response => response.json())
      .then(data => {
        switch (props.dataType) {
          case dataType.game:
            let gameElems: JSX.Element[] = [];
            for (let game of data.games) {
              gameElems.push(
                <option key={game.gameId} value={game.gameId}>{namePrettyPrint(game.name)}</option>
              );
            }
            setData(gameElems);
            break;

          case dataType.event:
            let eventElems: JSX.Element[] = [];
            for (let event of data) {
              eventElems.push(
                <option key={event.eventId} value={event.eventId}>{namePrettyPrint(event.description)}</option>
              );
            }
            setData(eventElems);
            break;
          case dataType.stage:
            let stageElems: JSX.Element[] = [];
            for (let stage of data) {
              stageElems.push(
                <option key={stage.stageId} value={stage.stageId}>{namePrettyPrint(stage.stageName)}</option>
              );
            }
            setData(stageElems);
            break;
          case dataType.match:
            let matchElems: JSX.Element[] = [];
            for (let match of data) {
              matchElems.push(
                // the endpoint doesn't return the team names and getting the form each team seems like it would be **very** slow
                <option key={match.matchId} value={match.matchId}>{`${match.firstTeamId} vs ${match.secondTeamId} (${match.firstTeamResult}:${match.secondTeamResult})`}</option>
              );
            }
            setData(matchElems);
            break;
          case dataType.teams:
            let teamElems: JSX.Element[] = [];
            for (let team of data) {
              teamElems.push(
                <option key={team.teamId} value={team.teamId}>{team.name}</option>
              );
            }
            setData(teamElems);
            break;
        }
      })
      .catch(error => console.error('Error:', error));
    }
  }, [props.isDisabled, props.gameId, props.eventId, props.stageId]);

  return (
    <FormControl isInvalid={props.isInvalid ?? undefined}>
      <FormLabel>{props.title?? formLabel}</FormLabel>
      <Select onChange={props.changeHandler} value={props.value?? undefined} isDisabled={props.isDisabled?? undefined}
        placeholder={props.placeholder?? placeholder}>
        {data}
      </Select>
      <FormErrorMessage>{errorMessage}</FormErrorMessage>
    </FormControl>
  )

  function namePrettyPrint(name: string) {

    // add names custom names here
    let prettyNames = {
      "": "Unnamed",
      "LOL": "League of Legends",
    };

    let prettyNameIndex = Object.keys(prettyNames).findIndex((element) => element === name);
    if (prettyNameIndex >= 0) {
      return Object.values(prettyNames)[prettyNameIndex];
    }

    name = name.toLowerCase();
    let capitalise = true;
    let prettyName = "";

    for (let letter of name) {
      if (letter === "_") {
        prettyName += " ";
        capitalise = true;
        continue;
      }
      if (capitalise) {
        prettyName += letter.toUpperCase();
        capitalise = false;
      } else {
        prettyName += letter;
      }
    }

    return prettyName;
  }
}
