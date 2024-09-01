import { Button, Divider, FormControl, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { cacheRequestAndRelog } from "../../../components/Navbar/Login/LoginScript";

export default function CreateMatch() {
  const horizontalFormSpacing = "2rem";

  const toast = useToast();

  const [stageId, setStageId] = useState<Number>();
  const [firstTeamId, setFirstTeamId] = useState<Number>();
  const [firstTeamResult, setFirstTeamResult] = useState<Number>();
  const [secondTeamId, setSecondTeamId] = useState<Number>();
  const [secondTeamResult, setSecondTeamResult] = useState<Number>();

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="column" spacing="3rem" className="Form">
        <DataPicker dataType={dataType.stage} changeHandler={(event) => {setStageId(Number(event.target.value))}} />

        <Stack direction="row" spacing={horizontalFormSpacing}>
          <Stack direction="column" spacing="3rem">
            <DataPicker dataType={dataType.event} changeHandler={(event) => {setFirstTeamId(Number(event.target.value))}} placeholder="Pretend this is a team picker"/>

            <FormControl>
              <FormLabel>First team result</FormLabel>
              <NumberInput onChange={(_, value) => {setFirstTeamResult(value)}}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Stack>

          <div>
            <Divider orientation="vertical" className="Divider" />
          </div>
        
          <Stack direction="column" spacing="3rem">
            <DataPicker dataType={dataType.event} changeHandler={(event) => {setSecondTeamId(Number(event.target.value))}} placeholder="Pretend this is a team picker"/>

            <FormControl>
              <FormLabel>Second team result</FormLabel>
              <NumberInput onChange={(_, value) => {setSecondTeamResult(value)}}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Stack>
        </Stack>

        <Button isDisabled={stageId == null || firstTeamId == null || firstTeamResult == null || secondTeamId == null || secondTeamResult == null} onClick={createMatch} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Create match</Button>
      
      </Stack>
    </div>
  )

  function createMatch() {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);
    headers.append("Content-Type", "application/json");
    
    const body = {
      stageId: stageId,
      firstTeamId: firstTeamId,
      firstTeamResult: firstTeamResult,
      secondTeamId: secondTeamId,
      secondTeamResult: secondTeamResult
    }

    if (Number(localStorage.getItem("jwsTtl")) < Date.now()) {
      let headersArray = new Array();
      headers.forEach((value, key) => {
        headersArray.push([key, value]);
      });
      cacheRequestAndRelog(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/match/create`),
        "POST",
        JSON.stringify(body),
        headersArray,
        "Match created successfully"
      )
    } else {
      fetch(
        ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/match/create`),
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      })
      .then(async response => {
        if (response.ok) {
          toast({
            title: 'Match created successfully',
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
