import { useEffect, useState } from 'react';
import * as jose from 'jose';
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
import { loginPath } from '../../../config/config';

export default function Login() {
  let isLogged = localStorage.getItem("jws") != null;
  const fallbackObject = JSON.stringify({id: "", avatar: ""});
  const [avatarUrl, setAvatarUrl] = useState(`https://cdn.discordapp.com/avatars/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).id}/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).avatar}.png`); 
  const [authUrl, setAuthUrl] = useState('');
  const [validLogin, setValidLogin] = useState(true);
  const navigate = useNavigate();

  const expirationWarning = (
    <a href={authUrl}>
      <Tooltip label="Your login expired. Click to relogin.">
        <WarningTwoIcon boxSize="2vw" color="GttOrange.400" />
      </Tooltip>
    </a>
  );

  useEffect(() => {
    if (!isLogged || !validLogin) {
      fetch(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + '/backend/discord/auth')
      )
      .then(response => response.json())
      .then(url => setAuthUrl(url.redirectUrl + `&redirect_uri=${window.location.origin + loginPath}`))
      .catch(error => console.error('Error:', error));
    } else if (avatarUrl === "https://cdn.discordapp.com/avatars//.png") {
      setAvatarUrl(`https://cdn.discordapp.com/avatars/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).id}/${JSON.parse(localStorage.getItem("userObject")?? fallbackObject).avatar}.png`)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogged, validLogin]);

  useEffect(() => {
    setInterval(() => {
      if(!isLogged || (jose.decodeJwt(localStorage.getItem("jws")?? "").exp?? 0) * 1000 < Date.now()) {
        setValidLogin(false);
      } else {
        setValidLogin(true);
      }
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <div>
              Your token expires at
              {` ${new Date((jose.decodeJwt(localStorage.getItem("jws")?? "").exp?? 0) * 1000).toLocaleTimeString()}`}
              <Button onClick={logout} >Logout</Button>
            </div> :
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
    // localStorage.removeItem("jwsTtl");
    setAvatarUrl("");
    navigate("/");
  }
}
