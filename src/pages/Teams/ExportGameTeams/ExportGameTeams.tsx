import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function ExportGameTeams() {
  const [gameId, setGameId] = useState("");
  const [game, setGame] = useState("");
  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <DataPicker dataType={dataType.game} changeHandler={selectGame} toast={toast} />

        <ConfirmationButton isDisabled={!gameId} onClick={downloadCSV}>Download CSV</ConfirmationButton>
      </EndpointForm>
    </div>
  )

  function selectGame(event: React.ChangeEvent<HTMLSelectElement>) {
    setGameId(event.target.value);
    setGame(event.target.selectedOptions[0].text.replaceAll(" ", "-"));
  }

  async function downloadCSV() {
    const rankNames:Record<number, string> = [];
    const roleNames:Record<number, string> = [];

    await fetchGracefully(backendUrl + `/backend/rank/list/${gameId}/`, {}, null, toast)
    .then(response => response.json())
    .then(ranks => {
      for (const rank of ranks) {
        rankNames[Number(rank.rankId)] = rank.rankName;
      }
    })

    await fetchGracefully(backendUrl + `/backend/generatedRole/list/${gameId}/`, {}, null, toast)
    .then(response => response.json())
    .then(roles => {
      for (const role of roles) {
        roleNames[Number(role.generatedRoleId)] = role.roleName;
      }
    })

    fetchGracefully(backendUrl + `/backend/team/list/participating/${gameId}/players/admin/false/`, {}, null, toast)
    .then(response => response.json())
    .then(users => {
      users.sort((a: any, b: any) => a.teamId - b.teamId);
      let csv = "Název týmu,Nick,Rank,Maximální rank,Role v týmu,Discord ID,ID týmu\n";
      for (const user of users) {
        csv += `${user.name},${user.nick},${rankNames[user.rank]??"neznámý"},${rankNames[user.maxRank]??"neznámý"},${roleNames[user.generatedRoleId]??"neznámá"},${user.userId},${user.teamId}\n`;
      }

      window.open(
        URL.createObjectURL(
          new File([csv], `${game}-teams.csv`, { type: "text/csv" })
        ),
        "_blank"
      );
    })
  }
}
