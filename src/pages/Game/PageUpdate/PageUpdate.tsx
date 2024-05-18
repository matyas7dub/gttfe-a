import ColorModeButton from '../../../components/ColorModeButton/ColorModeButton';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import { Stack, Button, useToast } from '@chakra-ui/react';
import Login from '../../../components/Login/Login';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import GamePicker from '../../../components/GamePicker/GamePicker';

export default function PageUpdate() {
  const [page, setPage] = useState("");
  const [gameId, setGameId] = useState("");

  const toast = useToast();

  const [selectorError, setSelectorError] = useState(false);

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="row" className="topRight">
        <Login />
        <ColorModeButton />
      </Stack>
      <Stack direction="column" spacing="3rem" className="Form">
        <GamePicker isInvalid={selectorError} changeHandler={(event) => {updateCurrentGame(event.target.value)}} />
        <MDEditor value={page} onChange={(change: any) => {setPage(change)}} height={500} />
        <Button onClick={uploadGamePage} fontSize="2rem" colorScheme="blue" width="fit-content" padding="1em">Update page</Button>
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

    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/game/${newGameId}/page/`)
    )
    .then(response => response.json())
    .then(data => setPage(data.page))
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

    let headers = new Headers();
    headers.append('Authorization', `Bearer ${localStorage.getItem('jws')}`);
    headers.append('Content-Type', 'application/json');

    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/game/${gameId}/page/`),
    {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({
        "game_id": gameId,
        "gamePage": page
      }),
    })
    .then(async response => {
      if (response.ok) {
        toast({
          title: 'Page updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true
        })
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.msg?? 'Unknown error.',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      }
    })
    .catch(error => {
      console.error('Error:', error);
    })
  }
}
