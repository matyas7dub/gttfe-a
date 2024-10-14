import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, useToast } from "@chakra-ui/react";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { useState } from "react";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";

export default function UpdateGame() {
  const horizontalFormSpacing = "2rem";

  const toast = useToast();

  const [gameErr, setGameErr] = useState(false);

  const [gameId, setGameId] = useState<Number>();
  const [regStart, setRegStart] = useState("");
  const [regEnd, setRegEnd] = useState("");
  const [maxTeams, setMaxTeams] = useState(0);
  const [backdrop, setBackdrop] = useState("");
  const [icon, setIcon] = useState("");

  return (
    <div>
      <Breadcrumbs />

      <Stack direction="column" spacing="3rem" className="Form">
        <DataPicker dataType={dataType.game} isInvalid={gameErr} changeHandler={(event) => selectGame(event.target.value)}/>

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Registration start</FormLabel>
            <Input max={regEnd} type='date' value={regStart} onChange={(event) => setRegStart(event.target.value)}/>
          </FormControl>

          <FormControl>
            <FormLabel>Registration end</FormLabel>
            <Input min={regStart}  type='date' value={regEnd} onChange={(event) => setRegEnd(event.target.value)} />
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>Maximum teams</FormLabel>
          <NumberInput min={0} value={maxTeams} onChange={(_, value) => {setMaxTeams(value)}}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <DataPicker title="Backdrop" value={backdrop} dataType={dataType.file} changeHandler={event => {setBackdrop(event.target.value)}} />

        <DataPicker title="Icon" value={icon} dataType={dataType.file} changeHandler={event => {setIcon(event.target.value)}} />

        <ConfirmationButton isDisabled={gameId == null} onClick={updateGame}>Update game</ConfirmationButton> 

      </Stack>
    </div>
  );

  function selectGame(newGameId: String) {
    if (newGameId === "") {
      setGameErr(true);
      setGameId(undefined);
      return;
    }

    setGameId(Number(newGameId));
    setGameErr(false);
    fetch(process.env.REACT_APP_BACKEND_URL + `/backend/game/${newGameId}/`)
    .then(response => response.json())
    .then(data => {

      if (data.registrationStart != null) {
        setRegStart(data.registrationStart);
      } else {
        const now = new Date().toISOString().split('T')[0].replace(/-/g, '-');
        setRegStart(now);
      }

      if (data.registrationEnd != null) {
        setRegEnd(data.registrationEnd);
      } else {
        const now = new Date().toISOString().split('T')[0].replace(/-/g, '-');
        setRegEnd(now);
      }

      if (data.maxTeams != null) {
        setMaxTeams(data.maxTeams);
      } else {
        setMaxTeams(0);
      }

      if (data.backdrop != null) {
        setBackdrop(data.backdrop);
      } else {
        setBackdrop("");
      }

      if (data.icon != null) {
        setIcon(data.icon);
      } else {
        setIcon("");
      }
    })
  }

  async function updateGame() {
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];

    const body = {
      registrationStart: regStart,
      registrationEnd: regEnd,
      maxTeams: maxTeams,
      backdrop: backdrop,
      icon: icon
    };
    
    fetchGracefully(process.env.REACT_APP_BACKEND_URL + `/backend/game/${gameId}/`,
    "PUT", JSON.stringify(body), headers, "Game updated successfully", toast);
  }
}
