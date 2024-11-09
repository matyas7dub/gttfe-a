import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import { useToast } from '@chakra-ui/react';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import DataPicker, { dataType } from '../../../components/DataPicker/DataPicker';
import { fetchGracefully } from '../../../components/Navbar/Login/LoginScript';
import ConfirmationButton from '../../../components/ConfirmationButton/ConfirmationButton';
import { backendUrl } from '../../../config/config';
import EndpointForm from '../../../components/EndpointForm/EndpointForm';

export default function PageUpdate() {
  const [page, setPage] = useState("");
  const [gameId, setGameId] = useState("");

  const toast = useToast();

  const [selectorError, setSelectorError] = useState(false);

  return (
    <div>
      <Breadcrumbs />
      <EndpointForm>
        <DataPicker dataType={dataType.game} isInvalid={selectorError} changeHandler={(event) => {updateCurrentGame(event.target.value)}} toast={toast} />
        <MDEditor value={page} onChange={(change: any) => {setPage(change)}} height={500} />
        <ConfirmationButton onClick={uploadGamePage}>Update page</ConfirmationButton>
      </EndpointForm>
    </div>
  );

  async function updateCurrentGame(newGameId: string) {
    setGameId(newGameId);
    if (newGameId === '') {
      setPage('');
      setSelectorError(true);
      return;
    }

    setSelectorError(false);

    fetch(backendUrl + `/backend/game/${newGameId}/page/`)
    .then(response => response.json())
    .then(data => setPage(data.gamePage))
    .catch(error => console.error('Error:', error));
  }

  async function uploadGamePage() {
    if (gameId === '') {
      setSelectorError(true);
      toast({
        title: 'Error',
        description: 'No game selected.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
      return;
    }

    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];

    const body = {
      game_id: gameId,
      gamePage: page
    }

    fetchGracefully(backendUrl + `/backend/game/${gameId}/page/`,
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: headers
    },
    "Page updated successfully", toast);
  }
}
