import { Button, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { cacheRequestAndRelog } from "../../../components/Navbar/Login/LoginScript";
import TeamResultInput from "../TeamResultInput";

export default function CreateMatch() {
  const toast = useToast();

  const [stageId, setStageId] = useState<number>();
  const [firstTeamId, setFirstTeamId] = useState<number>();
  const [firstTeamResult, setFirstTeamResult] = useState<number>();
  const [secondTeamId, setSecondTeamId] = useState<number>();
  const [secondTeamResult, setSecondTeamResult] = useState<number>();

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="column" spacing="3rem" className="Form">
        <DataPicker dataType={dataType.stage} changeHandler={(event) => {setStageId(Number(event.target.value))}} />

        <TeamResultInput stageId={stageId} setFirstTeamId={setFirstTeamId} setFirstTeamResult={setFirstTeamResult} setSecondTeamId={setSecondTeamId} setSecondTeamResult={setSecondTeamResult} />

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
