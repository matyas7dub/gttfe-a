import ColorModeButton from '../../../components/ColorModeButton/ColorModeButton';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import { Stack, Select, Button, useToast } from '@chakra-ui/react';
import Login from '../../../components/Login/Login';
import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

export default function PageUpdate() {
  const [games, setGames ] = useState<JSX.Element[]>();

  const [page, setPage] = useState("");
  const [gameId, setGameId] = useState("");

  const toast = useToast();

  useEffect(() => {
    fetch(process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz/backend/game/all/' : '/backend/game/all/')
    .then(response => response.json())
    .then(data => {
      let gameElems: JSX.Element[] = [];
      for (let game of data.games) {
        gameElems.push(
          <option value={game.gameId}>{game.name}</option>
        );
      }
      setGames(gameElems);
    })
    .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div>
      <Breadcrumbs />
      <Stack direction="row" className="topRight">
        <Login />
        <ColorModeButton />
      </Stack>
      <Stack direction="column" spacing="3rem" marginTop="5rem" width="75%">
        <Select id="gameSelect" onChange={(event) => {updateCurrentGame(event.target.value)}} placeholder='Select game'>
          {games}
        </Select>
        <MDEditor value={page} onChange={(change: any) => {setPage(change)}} height={500} />
        <Button onClick={uploadGamePage} fontSize="2rem" colorScheme="blue" width="fit-content" padding="1em">Update page</Button>
      </Stack>
    </div>
  );

  async function updateCurrentGame(gameId: string) {
    setGameId(gameId);
    if (gameId === '') {
      setPage('');
      return;
    }

    fetch(process.env.REACT_APP_PROD === 'yes' ? `https://gttournament.cz/backend/game/${gameId}/page/` : `/backend/game/${gameId}/page/`)
    .then(response => response.json())
    .then(data => setPage(data.page))
    .catch(error => console.error('Error:', error));
  }

  async function uploadGamePage() {
    if (gameId === '') {
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

    fetch(process.env.REACT_APP_PROD === 'yes' ? `https://gttournament.cz/backend/game/${gameId}/page/` : `/backend/game/${gameId}/page/`,
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
          description: data.msg,
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
