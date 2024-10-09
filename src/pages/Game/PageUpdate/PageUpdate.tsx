import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import { Stack, Button, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import DataPicker, { dataType } from '../../../components/DataPicker/DataPicker';
import { fetchGracefully } from '../../../components/Navbar/Login/LoginScript';

export default function PageUpdate() {
  const [page, setPage] = useState("");
  const [gameId, setGameId] = useState("");

  const toast = useToast();

  const [selectorError, setSelectorError] = useState(false);

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="column" spacing="3rem" className="Form">
        <DataPicker dataType={dataType.game} isInvalid={selectorError} changeHandler={(event) => {updateCurrentGame(event.target.value)}} />
        <MDEditor value={page} onChange={(change: any) => {setPage(change)}} height={500} />
        <Button onClick={uploadGamePage} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Update page</Button>
      </Stack>
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

    fetch(process.env.REACT_APP_BACKEND_URL + `/backend/game/${newGameId}/page/`)
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

    fetchGracefully(process.env.REACT_APP_BACKEND_URL + `/backend/game/${gameId}/page/`,
    "PUT", JSON.stringify(body), headers, "Page updated successfully", toast);
  }
}
