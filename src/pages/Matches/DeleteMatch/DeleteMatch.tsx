import { useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function DeleteMatch() {
  const [eventId, setEventId] = useState<number>();
  const [stageId, setStageId] = useState<number>();
  const [matchId, setMatchId] = useState<number>();
  const [firstTeamName, setFirstTeamName] = useState("");
  const [secondTeamName, setSecondTeamName] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker dataType={dataType.event} changeHandler={event => setEventId(Number(event.target.value))} />

        <DataPicker options={{eventId: eventId?? undefined}} dataType={dataType.stage} changeHandler={event => selectStage(Number(event.target.value))} />

        <DataPicker options={{eventId: eventId?? undefined, stageId: stageId?? undefined}}  dataType={dataType.match} changeHandler={event => selectMatch(Number(event.target.value))} />

        <ConfirmationButton isDisabled={!matchId} onClick={onOpen}>Delete match</ConfirmationButton>

        <ConfirmationModal isOpen={isOpen} onClose={onClose} body={`Do you really want to delete the match ${firstTeamName} vs ${secondTeamName}`} confirmFunction={deleteMatch} />
      </EndpointForm>
    </div>
  )

  function selectStage(newStageId: number) {
    setStageId(newStageId);
    if (!eventId) {
      fetch(backendUrl + `/backend/stage/${newStageId}/`)
      .then(response => response.json())
      .then(data => setEventId(Number(data.eventId)))
      .catch(error => console.error("Error", error));
    }
  }

  function selectMatch(newMatchId: number) {
    setMatchId(newMatchId);
    if (!stageId) {
      fetch(backendUrl + `/backend/match/${newMatchId}/`)
      .then(response => response.json())
      .then(data => {
        setStageId(Number(data.stageId));
        setFirstTeamName(getTeamName(Number(data.firstTeamId)));
        setSecondTeamName(getTeamName(Number(data.secondTeamId)));
      })
      .catch(error => console.error("Error", error));
    }
  }

  function getTeamName(teamId: number): string {
    fetch(backendUrl + `/backend/team/id/${teamId}/`)
    .then(response => response.json())
    .then(data => {
      return data.name
    })
    .catch(error => console.error("Error", error));
    return "Error";
  }

  function deleteMatch() {
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
    ];

    fetchGracefully(backendUrl + `/backend/match/${matchId}/`,
    {
      method: "DELETE",
      headers: headers
    },
    "Match deleted successfully", toast);
  }
}
