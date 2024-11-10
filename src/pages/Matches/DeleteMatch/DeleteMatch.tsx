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
        <DataPicker value={eventId} dataType={dataType.event} changeHandler={event => selectEvent(event)} toast={toast} />

        <DataPicker value={stageId} eventId={eventId} dataType={dataType.stage} changeHandler={event => selectStage(event)} toast={toast} />

        <DataPicker value={matchId} eventId={eventId} stageId={stageId}  dataType={dataType.match} changeHandler={event => selectMatch(event)} toast={toast} />

        <ConfirmationButton isDisabled={!matchId} onClick={onOpen}>Delete match</ConfirmationButton>

        <ConfirmationModal isOpen={isOpen} onClose={onClose} body={`Do you really want to delete the match ${firstTeamName} vs ${secondTeamName}`} confirmFunction={deleteMatch} />
      </EndpointForm>
    </div>
  )

  function selectEvent(event: React.ChangeEvent<HTMLSelectElement>) {
    const newEventId = Number(event.target.value);
    setEventId(newEventId);

    if (newEventId !== eventId || !newEventId) {
      setStageId(0);
      setMatchId(0);
    }
  }

  function selectStage(event: React.ChangeEvent<HTMLSelectElement>) {
    const newStageId = Number(event.target.value);
    setStageId(newStageId);
    inferEvent(newStageId);

    if (newStageId !== stageId || !newStageId) {
      setMatchId(0);
    }
  }

  function inferEvent(stage: number) {
    if (!eventId) {
      fetch(backendUrl + `/backend/stage/${stage}/`)
      .then(response => response.json())
      .then(data => setEventId(Number(data.eventId)))
      .catch(error => console.error("Error", error));
    }
  }

  function selectMatch(event: React.ChangeEvent<HTMLSelectElement>) {
    const newMatchId = Number(event.target.value);
    setMatchId(newMatchId);

    if (!newMatchId) {
      return;
    }

    fetch(backendUrl + `/backend/match/${newMatchId}/`)
    .then(response => response.json())
    .then(async data => {
      setStageId(Number(data.stageId));
      inferEvent(Number(data.stageId));
      setFirstTeamName(await getTeamName(data.firstTeamId));
      setSecondTeamName(await getTeamName(data.secondTeamId));
    })
    .catch(error => console.error("Error", error));
  }

  async function getTeamName(teamId: number): Promise<string> {
    let name = "Error";

    await fetch(backendUrl + `/backend/team/id/${teamId}/`)
    .then(response => response.json())
    .then(data => {
      name = data.name
    })
    .catch(error => console.error("Error", error));

    return name;
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
