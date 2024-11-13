import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control";
import { CreateToastFnReturn } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEventHandler, useState, useEffect } from "react";
import { backendUrl } from "../../config/config";
import { fetchGracefully } from "../Navbar/Login/LoginScript";

type DataPickerProps = {
  dataType: dataType,
  changeHandler: ChangeEventHandler<HTMLSelectElement>,
  toast: CreateToastFnReturn,
  isInvalid?: boolean,
  errorMessage?: string,
  placeholder?: string,
  title?: string,
  value?: number | string,
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
  assignedRoles,
  file,
}

export default function DataPicker(props: DataPickerProps) {
  const [optionElems, setOptionElems] = useState<JSX.Element[]>();

  // changes depending on data type
  const [formLabel, setFormLabel] = useState("Pick one");
  const [placeholder, setPlaceholder] = useState("Select one");
  const [errorMessage, setErrorMessage] = useState("You must select one!");


  useEffect(() => {
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
        if (props.eventId) {
          location = `/backend/event/${props.eventId}/stages/`
        } else {
          location = "/backend/stage/listAll/";
        }
        setFormLabel("Stage");
        setPlaceholder("Select a stage");
        setErrorMessage("You must select a stage!");
        break;
      case dataType.match:
        if (props.stageId) {
          location = `/backend/stage/${props.stageId}/matches/`;
        } else if (props.eventId) {
          location = `/backend/event/${props.eventId}/matches/`;
        } else {
          location = "/backend/match/listAll/";
        }
        setFormLabel("Match");
        setPlaceholder("Select a match");
        setErrorMessage("You must select a match!");
        break;
      case dataType.teams:
        if (!props.gameId && !props.isDisabled) {
          console.error("You need to provide a gameId for the teams data picker or disable it.")
          invalid = true;
        } else {
          location = `/backend/team/list/participating/${props.gameId}/false/`
          setFormLabel("Team")
          setPlaceholder("Select a team");
          setErrorMessage("You must select a team!");
        }
        break;
      case dataType.assignedRoles:
        location = '/backend/assignedRole/listAll/';
        setFormLabel("Role");
        setPlaceholder("Select a role");
        setErrorMessage("You must select a role!");
        break;
      case dataType.file:
        location = '/backend/file/list';
        setFormLabel("File");
        setPlaceholder("Select a file");
        setErrorMessage("You must select a file!");
        break;
    }

    if (!invalid && !props.isDisabled) {

      fetchGracefully(backendUrl + location, {}, null, props.toast)
      .then(response => response.json())
      .then(async data => {
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
            let eventNamesMap = await getEventNamesMap(props.toast);
            for (let stage of data) {
              stageElems.push(
                <option key={stage.stageId} value={stage.stageId}>{namePrettyPrint(eventNamesMap.get(stage.eventId)?? "") + " > " + namePrettyPrint(stage.stageName)}</option>
              );
            }
            setOptionElems(stageElems);
            break;
          case dataType.match:
            let matchElems: JSX.Element[] = [];
            let teamNamesMap = new Map<number, string>();
            if (data.length >= 1) {
              teamNamesMap = await getTeamNamesMap(data[0].stageId);
            }
            for (let match of data) {
              matchElems.push(
                <option key={match.matchId} value={match.matchId}>{`${teamNamesMap.get(match.firstTeamId)} vs ${teamNamesMap.get(match.secondTeamId)} (${match.firstTeamResult}:${match.secondTeamResult})`}</option>
              );
            }
            setOptionElems(matchElems);
            break;
          case dataType.teams:
            let teamElems: JSX.Element[] = [];
            const teamIds: number[] = [];
            for (let team of data) {
              if (!teamIds.includes(team.teamId)) {
                teamIds.push(team.teamId);
                teamElems.push(
                  <option key={team.teamId} value={team.teamId}>{team.name}</option>
                );
              }
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
          case dataType.file:
            console.debug(data);
            let fileElems: JSX.Element[] = [];
            for (let file of data) {
              fileElems.push(
                <option key={file.address} value={file.address}>{file.fileName}</option>
              );
            }
            setOptionElems(fileElems);
            break;
        }
      })
      .catch(error => console.error('Error:', error));
    }
  }, [props.isDisabled, props.dataType, props.gameId, props.eventId, props.stageId, props.toast]);

  return (
    <FormControl isInvalid={props.isInvalid ?? undefined}>
      <FormLabel>{props.title?? formLabel}</FormLabel>
      <Select onChange={props.changeHandler} value={props.value?? undefined} isDisabled={props.isDisabled?? undefined}
        placeholder={props.placeholder?? placeholder}>
        {optionElems}
      </Select>
      <FormErrorMessage>{props.errorMessage?? errorMessage}</FormErrorMessage>
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

  async function getTeamNamesMap(stageId: number): Promise<Map<number, string>> {
    const teamNamesMap = new Map<number, string>();

    await fetch(backendUrl + `/backend/stage/${stageId}/`)
    .then(response => response.json())
    .then(data => fetch(backendUrl + `/backend/event/${data.eventId}/`)
    .then(response => response.json())
    .then(data => fetch(backendUrl + `/backend/team/list/participating/${data.gameId}/false/`)
    .then(response => response.json())
    .then(data => {
      const teamIds: number[] = [];
      for (let team of data) {
        if (!teamIds.includes(team.teamId)) {
          teamIds.push(team.teamId);
          teamNamesMap.set(team.teamId, team.name);
        }
      }
    })))
    .catch(error => console.error("Error: ", error));

    return teamNamesMap;
  }

  async function getEventNamesMap(toast: CreateToastFnReturn): Promise<Map<number, string>> {
    const eventNamesMap = new Map<number, string>();

    await fetchGracefully(backendUrl + "/backend/event/listAll", {}, null, toast)
    .then(response => response.json())
    .then(events => {
      for (let event of events) {
        eventNamesMap.set(event.eventId, event.description);
      }
    })
    .catch(error => console.error("Error: ", error));

    return eventNamesMap;
  }
}
