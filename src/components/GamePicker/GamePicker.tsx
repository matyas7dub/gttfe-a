import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control";
import { Select } from "@chakra-ui/select";
import { ChangeEventHandler, useState, useEffect } from "react";

type GamePickerProps = {
  isInvalid?: boolean,
  changeHandler: ChangeEventHandler<HTMLSelectElement>,
  default?: string,
}
export default function GamePicker(props: GamePickerProps) {
  const [games, setGames] = useState<JSX.Element[]>();

  useEffect(() => {
    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + '/backend/game/all/')
    )
    .then(response => response.json())
    .then(data => {
      let gameElems: JSX.Element[] = [];
      for (let game of data.games) {
        gameElems.push(
          <option key={game.gameId} value={game.gameId}>{namePrettyPrint(game.name)}</option>
        );
      }
      setGames(gameElems);
    })
    .catch(error => console.error('Error:', error));
  }, []);

  return (
    <FormControl isInvalid={props.isInvalid ?? undefined}>
      <FormLabel>Game</FormLabel>
      <Select id="gameSelect" onChange={props.changeHandler} placeholder={props.default == undefined ? "Select a game" : props.default}>
        {games}
      </Select>
      <FormErrorMessage>Select a game</FormErrorMessage>
    </FormControl>
  )

  function namePrettyPrint(name: string) {

    // add names custom names here
    let prettyNames = {
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
