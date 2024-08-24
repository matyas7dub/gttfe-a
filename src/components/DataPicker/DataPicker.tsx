import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control";
import { Select } from "@chakra-ui/select";
import { ChangeEventHandler, useState, useEffect } from "react";

type DataPickerProps = {
  dataType: dataType,
  isInvalid?: boolean,
  changeHandler: ChangeEventHandler<HTMLSelectElement>,
  placeholder?: string,
  value?: number,
  isDisabled?: boolean,
}

export enum dataType {
  game,
  event,
  stage,
  match
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

    switch (props.dataType) {
      case dataType.game:
        location =  '/backend/game/all/';
        setFormLabel("Game");
        setPlaceholder("Select a game");
        setErrorMessage("You must select a game!");
        break;
      case dataType.event:
        location = '/backend/event/list';
        setFormLabel("Event");
        setPlaceholder("Select an event");
        setErrorMessage("You must select an event!");
        break;
      case dataType.stage:
        console.error("Stages unimplemented");
        setFormLabel("Stage");
        setPlaceholder("Select a stage");
        setErrorMessage("You must select a stage!");
        // location = "";
        break;
      case dataType.match:
        console.error("Matches unimplemented");
        setFormLabel("Match");
        setPlaceholder("Select a match");
        setErrorMessage("You must select a match!");
        // location = "";
        break;

      // no default because the enum solves that
    }

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
      }
    })
    .catch(error => console.error('Error:', error));
  }, []);

  return (
    <FormControl isInvalid={props.isInvalid ?? undefined}>
      <FormLabel>{formLabel}</FormLabel>
      <Select onChange={props.changeHandler} value={props.value?? undefined} isDisabled={props.isDisabled?? undefined}
        placeholder={props.placeholder == undefined ? placeholder : props.placeholder}>
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
