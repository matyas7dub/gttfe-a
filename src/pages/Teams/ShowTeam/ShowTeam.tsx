import { WarningIcon } from "@chakra-ui/icons";
import { Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function ShowTeam() {
  const [gameId, setGameId] = useState<Number|undefined>(undefined);
  const [team, setTeam] = useState<JSX.Element[]>();
  const toast = useToast();
  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker dataType={dataType.game} changeHandler={event => setGameId(Number(event.target.value))} toast={toast} />
        <DataPicker dataType={dataType.teams} isDisabled={!gameId} gameId={gameId} changeHandler={event => selectTeam(event.target.value)} toast={toast} />

        <span style={{color: "orange"}}><WarningIcon />WIP</span>

        <Stack direction="column">
          {team}
        </Stack>
      </EndpointForm>
    </div>
  )

  function selectTeam(teamId: string) {
    if (teamId === "") {
      return;
    }

    fetchGracefully(backendUrl + `/backend/team/id/${teamId}/`, {}, null, toast)
    .then(response => response.json())
    .then(async teamData => {
      const tempTeam: JSX.Element[] = [];

      for (const player of teamData.Players) {
        tempTeam.push(<p>Nick: {player.nick}</p>);
        tempTeam.push(<p>Discord id: {player.userId}</p>);
      }

      setTeam(tempTeam);
    })
  }
}
