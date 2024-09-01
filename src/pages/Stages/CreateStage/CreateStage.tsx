import { Button, FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { cacheRequestAndRelog } from "../../../components/Navbar/Login/LoginScript";

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
            <FormLabel>Index</FormLabel>
            <NumberInput onChange={(_, value) => {setStageIndex(value)}}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack>

        <Button isDisabled={eventId == null || stageName == "" || stageIndex == null} onClick={createStage} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Create stage</Button>

      </Stack>
    </div>
  )

  function createStage() {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);
    headers.append("Content-Type", "application/json");
      
    const body = {
      eventId: eventId,
      stageName: stageName,
      stageIndex: stageIndex
    }

    if (Number(localStorage.getItem("jwsTtl")) < Date.now()) {
      let headersArray = new Array();
      headers.forEach((value, key) => {
        headersArray.push([key, value]);
      });
      cacheRequestAndRelog(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/stage/create`),
        "POST",
        JSON.stringify(body),
        headersArray,
        "Stage created successfully"
      )
    } else {
      fetch(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/stage/create`),
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      })
      .then(async response => {
        if (response.ok) {
          toast({
            title: 'Stage created successfully',
            status: 'success',
            duration: 5000,
            isClosable: true
          })
        } else {
          const data = await response.json();
          toast({
            title: 'Error',
            description: data.msg?? data.message?? 'Unknown error.',
            status: 'error',
            duration: 5000,
            isClosable: true
          })
        }
      })
      .catch(error => console.error("Error", error));
    }
  }
}

