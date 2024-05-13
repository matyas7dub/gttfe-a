import { useEffect, useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Avatar,
  Button,
  Center,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

export default function Login() {
  let isLogged = localStorage.getItem("jws") != null;
  const userName = localStorage.getItem("userName");
  const avatarUrl = localStorage.getItem("avatarUrl");
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    fetch(process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz/backend/discord/auth' : '/backend/discord/auth')
    .then(response => response.json())
    .then(url => setAuthUrl(url.redirect_url + `&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}`))
    .catch(error => console.error('Error:', error));
  }, []);

  return(
    <div>
      <Popover>
        <PopoverTrigger>
          <Avatar name={userName?? ''} src={avatarUrl?? ''} />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>{ isLogged ? 'Logout' : 'Login' }</PopoverHeader>
          <PopoverBody>
            <Center>
            {isLogged ? 
            <Button onClick={logout} >Logout</Button> :
            <a href={authUrl}><Button>Discord redirect <ExternalLinkIcon /></Button></a>
            }
            </Center>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </div>
  )

  function logout() {
    localStorage.removeItem("jws");
    localStorage.removeItem("avatarUrl");
    localStorage.removeItem("userName");
    window.location.reload();
  }
}
