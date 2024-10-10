import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, Switch, useToast } from "@chakra-ui/react";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { useState } from "react";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";

export default function UpdateGame() {
  const horizontalFormSpacing = "2rem";
  const inputToggleMargin = "0.5rem";

  const toast = useToast();

  const [gameErr, setGameErr] = useState(false);

  const [regStartEnabled, setRegStartEnabled] = useState(false);
  const [regEndEnabled, setRegEndEnabled] = useState(false);
  const [maxTeamsEnabled, setMaxTeamsEnabled] = useState(false);

  const [gameId, setGameId] = useState<Number>();
  const [regStart, setRegStart] = useState<String>();
  const [regEnd, setRegEnd] = useState<String>();
  const [maxTeams, setMaxTeams] = useState(0);

  return (
    <div>
      <Breadcrumbs />

      <Stack direction="column" spacing="3rem" className="Form">
        <DataPicker dataType={dataType.game} isInvalid={gameErr} changeHandler={(event) => selectGame(event.target.value)}/>

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Registration start</FormLabel>
            <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={regStartEnabled} onChange={(event) => setRegStartEnabled(event.target.checked)} />
            <Input max={regEndEnabled ? String(regEnd) : undefined} isDisabled={!regStartEnabled} type='date' value={regStartEnabled ? String(regStart) : ""} onChange={(event) => setRegStart(event.target.value)}/>
          </FormControl>

          <FormControl>
            <FormLabel>Registration end</FormLabel>
            <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={regEndEnabled} onChange={(event) => setRegEndEnabled(event.target.checked)} />
            <Input min={regStartEnabled ? String(regStart) : undefined} isDisabled={!regEndEnabled} type='date' value={regEndEnabled ? String(regEnd) : ""} onChange={(event) => setRegEnd(event.target.value)} />
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>Maximum teams</FormLabel>
          <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={maxTeamsEnabled} onChange={(event) => setMaxTeamsEnabled(event.target.checked)} />
          <NumberInput min={0} isDisabled={!maxTeamsEnabled} value={maxTeamsEnabled ? String(maxTeams) : ""} onChange={(_, value) => {setMaxTeams(value)}}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <ConfirmationButton isDisabled={gameId == null} onClick={updateGame}>Update game</ConfirmationButton> 

      </Stack>
    </div>
  );

  function selectGame(newGameId: String) {
    if (newGameId === "") {
      setGameErr(true);
      setGameId(undefined);
      setRegStartEnabled(false);
      setRegEndEnabled(false);
      setMaxTeamsEnabled(false);
      return;
    }

    setGameId(Number(newGameId));
    setGameErr(false);
    fetch(process.env.REACT_APP_BACKEND_URL + `/backend/game/${newGameId}/`)
    .then(response => response.json())
    .then(data => {

      if (data.registrationStart != null) {
        setRegStart(data.registrationStart);
        setRegStartEnabled(true);
      } else {
        setRegStartEnabled(false);
        const now = new Date().toISOString().split('T')[0].replace(/-/g, '-');
        setRegStart(now);
      }

      if (data.registrationEnd != null) {
        setRegEnd(data.registrationEnd);
        setRegEndEnabled(true);
      } else {
        setRegEndEnabled(false);
        const now = new Date().toISOString().split('T')[0].replace(/-/g, '-');
        setRegEnd(now);
      }

      if (data.maxTeams != null) {
        setMaxTeams(data.maxTeams);
        setMaxTeamsEnabled(true);
      } else {
        setMaxTeamsEnabled(false);
        setMaxTeams(0);
      }
    })
  }

  async function updateGame() {
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];

    const body = {};

    if (regStartEnabled) {
      Object.assign(body, { registrationStart: regStart });
    }

    if (regEndEnabled) {
      Object.assign(body, { registrationEnd: regEnd });
    }

    if (maxTeamsEnabled) {
      Object.assign(body, { maxTeams: maxTeams });
    }

    fetchGracefully(process.env.REACT_APP_BACKEND_URL + `/backend/game/${gameId}/`,
    "PUT", JSON.stringify(body), headers, "Game updated successfully", toast);
  }
}
