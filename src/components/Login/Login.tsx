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
  let [isLogged, setLogged] = useState(true);
  const userName = localStorage.getItem("userName");
  const avatarUrl = localStorage.getItem("avatarUrl");
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    fetch(process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz/backend/discord/auth' : 'http://127.0.0.1:5000/backend/discord/auth')
    .then(response => response.json())
    .then(url => setAuthUrl(url))
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
            <a href={authUrl}><Button onClick={login}>Discord redirect <ExternalLinkIcon /></Button></a>
            }
            </Center>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </div>
  )

  function login() {
    console.debug("login test");
    setLogged(true);
  }

  function logout() {
    console.debug("logout test");
    setLogged(false);
  }
}
