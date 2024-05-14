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
import { useNavigate } from 'react-router-dom';

export default function Login() {
  let isLogged = localStorage.getItem("jws") != null;
  const fallbackObject = JSON.stringify({"id": "", "avatar": ""});
  const [avatarUrl, setAvatarUrl] = useState(`https://cdn.discordapp.com/avatars/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).id}/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).avatar}.png`); 
  const [authUrl, setAuthUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogged) {
      fetch(process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz/backend/discord/auth' : '/backend/discord/auth')
      .then(response => response.json())
      .then(url => setAuthUrl(url.redirect_url + `&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}`))
      .catch(error => console.error('Error:', error));
    }
  }, [isLogged]);

  return(
    <div>
      <Popover>
        <PopoverTrigger>
          <Avatar key={avatarUrl} name={JSON.parse(localStorage.getItem("userObject")?? "{}").username} src={localStorage.getItem("userObject") != null ? avatarUrl : ''} />
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
    localStorage.removeItem("userObject");
    setAvatarUrl("");
    navigate("/");
  }
}
