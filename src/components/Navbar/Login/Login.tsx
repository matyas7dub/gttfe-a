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
  Stack,
  Tooltip,
} from '@chakra-ui/react'
import { ExternalLinkIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom';

export default function Login() {
  let isLogged = localStorage.getItem("jws") != null;
  const fallbackObject = JSON.stringify({"id": "", "avatar": ""});
  const [avatarUrl, setAvatarUrl] = useState(`https://cdn.discordapp.com/avatars/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).id}/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).avatar}.png`); 
  const [authUrl, setAuthUrl] = useState('');
  const [jwsTtl, setJwsTtl] = useState(Number(localStorage.getItem("jwsTtl")));
  const [validLogin, setValidLogin] = useState(true);
  const navigate = useNavigate();

  const expirationWarning = (
    <Tooltip label="Your login expired.">
      <WarningTwoIcon boxSize="2vw" color="GttOrange.400" />
    </Tooltip>
  );

  useEffect(() => {
    if (!isLogged) {
      fetch(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + '/backend/discord/auth')
      )
      .then(response => response.json())
      .then(url => setAuthUrl(url.redirect_url + `&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}`))
      .catch(error => console.error('Error:', error));
    } else {
      if (avatarUrl === "https://cdn.discordapp.com/avatars//.png") {
        setAvatarUrl(`https://cdn.discordapp.com/avatars/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).id}/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).avatar}.png`)
      }

      setJwsTtl(Number(localStorage.getItem("jwsTtl")));
      if (jwsTtl > Date.now()) {
        setValidLogin(true);

        setTimeout(() => {
          setJwsTtl(Number(localStorage.getItem("jwsTtl")));
          if (jwsTtl < Date.now()) {
            setValidLogin(false);
          };
        }, jwsTtl - Date.now() + 1000); // extra second to make sure it is invalid by that time

      } else {
        setValidLogin(false);
      };
    };
  }, [isLogged]);

  return(
    <Stack direction="row" align="center">
      {!validLogin && isLogged ? expirationWarning : null}
      <Popover>
        <PopoverTrigger>
          <Avatar key={avatarUrl} name={JSON.parse(localStorage.getItem("userObject")?? "{}").username}
            src={localStorage.getItem("userObject") != null && avatarUrl !== "https://cdn.discordapp.com/avatars//.png" ? avatarUrl : ''} />
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
    </Stack>
  )

  function logout() {
    localStorage.removeItem("jws");
    localStorage.removeItem("userObject");
    localStorage.removeItem("jwsTtl");
    setAvatarUrl("");
    navigate("/");
  }
}