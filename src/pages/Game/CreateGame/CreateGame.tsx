import { FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl, horizontalFormSpacing } from "../../../config/config";

export default function CreateGame() {
  const [gameName, setGameName] = useState("");
  const [regStart, setRegStart] = useState("");
  const [regEnd, setRegEnd] = useState("");
  const [maxTeams, setMaxTeams] = useState(0);
  const [backdrop, setBackdrop] = useState("");
  const [icon, setIcon] = useState("");

  const toast = useToast();
  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <FormControl>
          <FormLabel>Game name</FormLabel>
          <Input type="text" onChange={event => setGameName(event.target.value)} />
        </FormControl>

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Registration start</FormLabel>
            <Input max={regEnd !== "" ? String(regEnd) : undefined} type='datetime-local' onChange={(event) => setRegStart(event.target.value)}/>
          </FormControl>

          <FormControl>
            <FormLabel>Registration end</FormLabel>
            <Input min={regStart !== "" ? String(regStart) : undefined} type='datetime-local' onChange={(event) => setRegEnd(event.target.value)} />
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

        <DataPicker title="Backdrop" dataType={dataType.file} changeHandler={event => {setBackdrop(event.target.value)}} toast={toast} />

        <DataPicker title="Icon" dataType={dataType.file} changeHandler={event => {setIcon(event.target.value)}} toast={toast} />

        <ConfirmationButton isDisabled={gameName === "" || regStart === "" || regEnd === ""} onClick={createGame}>Update game</ConfirmationButton> 

      </EndpointForm>
    </div>
  )

  function createGame() {
    fetchGracefully(backendUrl + "/backend/game/create",
    {
      method: "POST",
      body: JSON.stringify({
        name: gameName,
        registrationStart: regStart,
        registrationEnd: regEnd,
        maxTeams: maxTeams,
        backdrop: backdrop,
        icon: icon
      }),
      headers: {"Content-Type": "application/json"}
    },
    "Game created successfully", toast);
  }
}
