import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { Button, FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, Switch, useToast } from "@chakra-ui/react";
import GamePicker from "../../../components/GamePicker/GamePicker";
import { useState } from "react";

export default function Update() {
  const horizontalFormSpacing = "2rem";
  const inputToggleMargin = "0.5rem";

  const toast = useToast();

  const [gameErr, setGameErr] = useState(false);

  const [regStartEnabled, setRegStartEnabled] = useState(false);
  const [regEndEnabled, setRegEndEnabled] = useState(false);
  const [maxCaptainsEnabled, setMaxCaptainsEnabled] = useState(false);
  const [minCaptainsEnabled, setMinCaptainsEnabled] = useState(false);
  const [maxMembersEnabled, setMaxMembersEnabled] = useState(false);
  const [minMembersEnabled, setMinMembersEnabled] = useState(false);
  const [maxReserveEnabled, setMaxReserveEnabled] = useState(false);
  const [minReserveEnabled, setMinReserveEnabled] = useState(false);
  const [maxTeamsEnabled, setMaxTeamsEnabled] = useState(false);

  const [gameId, setGameId] = useState<Number>();
  const [regStart, setRegStart] = useState<String>();
  const [regEnd, setRegEnd] = useState<String>();
  const [maxCaptains, setMaxCaptains] = useState(1);
  const [minCaptains, setMinCaptains] = useState(1);
  const [maxMembers, setMaxMembers] = useState(1);
  const [minMembers, setMinMembers] = useState(1);
  const [maxReserve, setMaxReserve] = useState(0);
  const [minReserve, setMinReserve] = useState(0);
  const [maxTeams, setMaxTeams] = useState(1);

  return (
    <div>
      <Breadcrumbs />

      <Stack direction="column" spacing="3rem" className="Form">
        <GamePicker isInvalid={gameErr} changeHandler={(event) => setGame(event.target.value)}/>

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

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Maximum captains</FormLabel>
            <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={maxCaptainsEnabled} onChange={(event) => setMaxCaptainsEnabled(event.target.checked)} />
            <NumberInput min={minCaptainsEnabled ? minCaptains : 0} isDisabled={!maxCaptainsEnabled} value={maxCaptainsEnabled ? maxCaptains : ""} onChange={(_, value) => {setMaxCaptains(value)}}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Minimum captains</FormLabel>
            <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={minCaptainsEnabled} onChange={(event) => setMinCaptainsEnabled(event.target.checked)} />
            <NumberInput min={0} max={maxCaptainsEnabled ? maxCaptains : undefined} isDisabled={!minCaptainsEnabled} value={minCaptainsEnabled ? minCaptains : ""} onChange={(_, value) => {setMinCaptains(value)}}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Maximum members</FormLabel>
            <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={maxMembersEnabled} onChange={(event) => setMaxMembersEnabled(event.target.checked)} />
            <NumberInput min={minMembersEnabled ? minMembers : 0} isDisabled={!maxMembersEnabled} value={maxMembersEnabled ? maxMembers : ""} onChange={(_, value) => {setMaxMembers(value)}}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Minimum members</FormLabel>
            <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={minMembersEnabled} onChange={(event) => setMinMembersEnabled(event.target.checked)} />
            <NumberInput min={0} max={maxMembersEnabled ? maxMembers : undefined} isDisabled={!minMembersEnabled} value={minMembersEnabled ? minMembers : ""} onChange={(_, value) => {setMinMembers(value)}}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Maximum reserve</FormLabel>
            <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={maxReserveEnabled} onChange={(event) => setMaxReserveEnabled(event.target.checked)} />
            <NumberInput min={minReserveEnabled ? minReserve : 0} isDisabled={!maxReserveEnabled} value={maxReserveEnabled ? String(maxReserve) : ""} onChange={(_, value) => {setMaxReserve(value)}}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Minimum reserve</FormLabel>
            <Switch marginBottom={inputToggleMargin} isDisabled={gameId == null} isChecked={minReserveEnabled} onChange={(event) => setMinReserveEnabled(event.target.checked)} />
            <NumberInput min={0} max={maxReserveEnabled ? maxReserve : undefined} isDisabled={!minReserveEnabled} value={minReserveEnabled ? String(minReserve) : ""} onChange={(_, value) => {setMinReserve(value)}}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={horizontalFormSpacing}>
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
        </Stack>

        <Button isDisabled={gameId == null} onClick={updateGame} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Update game</Button>

      </Stack>
    </div>
  );

  function setGame(newGameId: String) {
    if (newGameId == "") {
      setGameErr(true);
      setGameId(undefined);
      setRegStartEnabled(false);
      setRegEndEnabled(false);
      setMaxCaptainsEnabled(false);
      setMinCaptainsEnabled(false);
      setMaxMembersEnabled(false);
      setMinMembersEnabled(false);
      setMaxReserveEnabled(false);
      setMinReserveEnabled(false);
      setMaxTeamsEnabled(false);
      return;
    }

    setGameId(Number(newGameId));
    setGameErr(false);
    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/game/${newGameId}/`)
    )
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

      if (data.maxCaptains != null) {
        setMaxCaptains(data.maxCaptains);
        setMaxCaptainsEnabled(true);
      } else {
        setMaxCaptainsEnabled(false);
        setMaxCaptains(1);
      }

      if (data.minCaptains != null) {
        setMinCaptains(data.minCaptains);
        setMinCaptainsEnabled(true);
      } else {
        setMinCaptainsEnabled(false);
        setMinCaptains(1);
      }

      if (data.maxMembers != null) {
        setMaxMembers(data.maxMembers);
        setMaxMembersEnabled(true);
      } else {
        setMaxMembersEnabled(false);
        setMaxMembers(1);
      }

      if (data.minMembers != null) {
        setMinMembers(data.minMembers);
        setMinMembersEnabled(true);
      } else {
        setMinMembersEnabled(false);
        setMinMembers(1);
      }

      if (data.maxReservist != null) {
        setMaxReserve(data.maxReservist);
        setMaxReserveEnabled(true);
      } else {
        setMaxReserveEnabled(false);
        setMaxReserve(0);
      }

      if (data.minReservist != null) {
        setMinReserve(data.minReservist);
        setMinReserveEnabled(true);
      } else {
        setMinReserveEnabled(false);
        setMinReserve(0);
      }

      if (data.maxTeams != null) {
        setMaxTeams(data.maxTeams);
        setMaxTeamsEnabled(true);
      } else {
        setMaxTeamsEnabled(false);
        setMaxTeams(1);
      }
    })
  }

  async function updateGame() {
    const header = new Headers();
    header.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);
    header.append("Content-Type", "application/json");

    let body = { game_id: gameId };

    if (regStartEnabled) {
      Object.assign(body, { registrationStart: regStart });
    }

    if (regEndEnabled) {
      Object.assign(body, { registrationEnd: regEnd });
    }

    if (maxCaptainsEnabled) {
      Object.assign(body, { maxCaptains: maxCaptains });
    }

    if (minCaptainsEnabled) {
      Object.assign(body, { minCaptains: minCaptains });
    }

    if (maxMembersEnabled) {
      Object.assign(body, { maxMembers: maxMembers });
    }

    if (minMembersEnabled) {
      Object.assign(body, { minMembers: minMembers });
    }

    if (maxReserveEnabled) {
      Object.assign(body, { maxReservists: maxReserve });
    }

    if (minReserveEnabled) {
      Object.assign(body, { minReservists: minReserve });
    }

    if (maxTeamsEnabled) {
      Object.assign(body, { maxTeams: maxTeams });
    }

    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + '/backend/game/all/')
    , {
        method: "PUT",
        headers: header,
        body: JSON.stringify(body),
    })
    .then(async response => {
      if (response.ok) {
        toast({
          title: 'Page updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true
        })
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.msg?? 'Unknown error.',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      }
    })
    .catch(error => console.error("Error:", error));
  }
}
