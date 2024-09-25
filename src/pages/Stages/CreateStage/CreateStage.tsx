import { QuestionIcon } from "@chakra-ui/icons";
import { Button, FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, Tooltip, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";

export default function CreateStage() {
  const horizontalFormSpacing = "2rem";

  const toast = useToast();

  const [eventId, setEventId] = useState<Number>();
  const [stageName, setStageName] = useState("");
  const [stageIndex, setStageIndex] = useState<Number>();

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="column" spacing="3rem" className="Form">
        <DataPicker dataType={dataType.event} changeHandler={(event)=>{setEventId(Number(event.target.value))}} />

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input type="text" onChange={(event) => {setStageName(event.target.value)}} />
          </FormControl>

          <FormControl>
            <FormLabel>Index/Level <Tooltip label="i. e. quarterfinals = 1, semifinals = 2, finals = 3"><QuestionIcon /></Tooltip></FormLabel>
            <NumberInput onChange={(_, value) => {setStageIndex(value)}}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack>

        <Button isDisabled={eventId == null || stageName === "" || stageIndex == null} onClick={createStage} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Create stage</Button>

      </Stack>
    </div>
  )

  function createStage() {
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];
      
    const body = {
      eventId: eventId,
      stageName: stageName,
      stageIndex: stageIndex
    }

    fetchGracefully(((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/stage/create`),
    "POST", JSON.stringify(body), headers, "Stage created successfully", toast);
  }
}

