import { Button, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
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
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];
    
    const body = {
      stageId: stageId,
      firstTeamId: firstTeamId,
      firstTeamResult: firstTeamResult,
      secondTeamId: secondTeamId,
      secondTeamResult: secondTeamResult
    }

    fetchGracefully(process.env.REACT_APP_BACKEND_URL + `/backend/match/create`,
    "POST", JSON.stringify(body), headers, "Match created successfully", toast);
  }
}
