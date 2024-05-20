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
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + '/backend/game/all/')
    )
    .then(response => response.json())
    .then(data => {
      let gameElems: JSX.Element[] = [];
      for (let game of data.games) {
        gameElems.push(
          <option key={game.gameId} value={game.gameId}>{game.name}</option>
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
}
