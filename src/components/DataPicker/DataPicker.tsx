import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control";
import { Select } from "@chakra-ui/select";
import { ChangeEventHandler, useState, useEffect } from "react";

type DataPickerProps = {
  dataType: dataType,
  changeHandler: ChangeEventHandler<HTMLSelectElement>,
  isInvalid?: boolean,
  placeholder?: string,
  title?: string,
  value?: number,
  isDisabled?: boolean,
  options?: DataPickerOptions
}

// optional props for some data types
type DataPickerOptions = {
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
  assignedRoles,
}

export default function DataPicker(props: DataPickerProps) {
  const [optionElems, setOptionElems] = useState<JSX.Element[]>();

  // changes depending on data type
  const [formLabel, setFormLabel] = useState("Pick one");
  const [placeholder, setPlaceholder] = useState("Select one");
  const [errorMessage, setErrorMessage] = useState("You must select one!");

  props.options = props.options?? {} as DataPickerOptions; // this is to make the linter shut up about options possibly being undefined

  useEffect(() => {
    const url = process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL;
    let location = "";
    let invalid = false;

    props.options = props.options?? {} as DataPickerOptions; // this is to make the linter shut up about options possibly being undefined

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
        if (props.options.eventId) {
          location = `/backend/event/${props.options.eventId}/stages/`
        } else {
          location = "/backend/stage/listAll/";
        }
        setFormLabel("Stage");
        setPlaceholder("Select a stage");
        setErrorMessage("You must select a stage!");
        break;
      case dataType.match:
        if (props.options.stageId) {
          location = `/backend/stage/${props.options.stageId}/matches/`;
        } else if (props.options.eventId) {
          location = `/backend/event/${props.options.eventId}/matches/`;
        } else {
          location = "/backend/match/listAll/";
        }
        setFormLabel("Match");
        setPlaceholder("Select a match");
        setErrorMessage("You must select a match!");
        break;
      case dataType.teams:
        if (!props.options.gameId) {
          console.error("You need to provide a gameId for the teams data picker")
          invalid = true;
        }
        location = `/backend/team/list/participating/${props.options.gameId}/false/`
        setFormLabel("Team")
        setPlaceholder("Select a team");
        setErrorMessage("You must select a team!");
        break;
      case dataType.assignedRoles:
        location = '/backend/assignedRole/listAll';
        setFormLabel("Role");
        setPlaceholder("Select a role");
        setErrorMessage("You must select a role!");
        break;
    }

    if (!invalid && !props.isDisabled) {
      fetch(url + location)
      .then(response => response.json())
      .then(data => {
        switch (props.dataType) {
          case dataType.game:
            let gameElems: JSX.Element[] = [];
            for (let game of data) {
              gameElems.push(
                <option key={game.gameId} value={game.gameId}>{namePrettyPrint(game.name)}</option>
              );
            }
            setOptionElems(gameElems);
            break;

          case dataType.event:
            let eventElems: JSX.Element[] = [];
            for (let event of data) {
              eventElems.push(
                <option key={event.eventId} value={event.eventId}>{namePrettyPrint(event.description)}</option>
              );
            }
            setOptionElems(eventElems);
            break;
          case dataType.stage:
            let stageElems: JSX.Element[] = [];
            for (let stage of data) {
              stageElems.push(
                <option key={stage.stageId} value={stage.stageId}>{namePrettyPrint(stage.stageName)}</option>
              );
            }
            setOptionElems(stageElems);
            break;
          case dataType.match:
            let matchElems: JSX.Element[] = [];
            for (let match of data) {
              matchElems.push(
                // the endpoint doesn't return the team names and getting the form each team seems like it would be **very** slow
                <option key={match.matchId} value={match.matchId}>{`${match.firstTeamId} vs ${match.secondTeamId} (${match.firstTeamResult}:${match.secondTeamResult})`}</option>
              );
            }
            setOptionElems(matchElems);
            break;
          case dataType.teams:
            let teamElems: JSX.Element[] = [];
            for (let team of data) {
              teamElems.push(
                <option key={team.teamId} value={team.teamId}>{team.name}</option>
              );
            }
            setOptionElems(teamElems);
            break;
          case dataType.assignedRoles:
            let roleElems: JSX.Element[] = [];
            for (let role of data) {
              roleElems.push(
                <option key={role.assignedRoleId} value={role.assignedRoleId}>{role.roleName}</option>
              );
            }
            setOptionElems(roleElems);
            break;
        }
      })
      .catch(error => console.error('Error:', error));
    }
  }, [props.isDisabled, props.dataType, props.options.gameId, props.options.eventId, props.options.stageId]);

  return (
    <FormControl isInvalid={props.isInvalid ?? undefined}>
      <FormLabel>{props.title?? formLabel}</FormLabel>
      <Select onChange={props.changeHandler} value={props.value?? undefined} isDisabled={props.isDisabled?? undefined}
        placeholder={props.placeholder?? placeholder}>
        {optionElems}
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
