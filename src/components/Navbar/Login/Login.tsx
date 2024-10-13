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
import { loginPath } from '../../../config/config';

export default function Login() {
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("userObject") ? getAvatarFromUserObject() : "");
  const [avatarKey, setAvatarKey] = useState(0);
  const [authUrl, setAuthUrl] = useState("");
  const [validLoginState, setValidLoginState] = useState(true);

  useEffect(() => {
    if (!validLoginState) {
      fetch(process.env.REACT_APP_BACKEND_URL + '/backend/discord/auth')
      .then(response => response.json())
      .then(url => setAuthUrl(url.redirectUrl + `&redirect_uri=${window.location.origin + loginPath}`))
      .catch(error => console.error('Error:', error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validLoginState]);

  useEffect(() => {
    const validLogin = validJws();
    setValidLoginState(validLogin);

    if (avatarUrl.length === 0) {
      setAvatarUrl(getAvatarFromUserObject());
      setAvatarKey(avatarKey + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function validJws() {
    if (localStorage.getItem("jws")) {
      const remainingTime = remainingJwsTime(localStorage.getItem("jws") as string);
      if (remainingTime > 0) {
        setTimeout(() => {setValidLoginState(validJws())}, remainingTime);
        return true;
      }
    }
    return false;
  }

  function remainingJwsTime(jws: string) {
    const expirationTime = (jose.decodeJwt(jws).exp?? 0) * 1000;
    return expirationTime - Date.now();
  }

  function getAvatarFromUserObject() {
    const userObject = localStorage.getItem("userObject");
    if (userObject) {
      const userJsonObject = JSON.parse(userObject);
      return `https://cdn.discordapp.com/avatars/${userJsonObject.id}/${userJsonObject.avatar}.png`;
    }
    return "";
  }

  return(
    <Stack direction="row" align="center">
      <ExpirationWarning authUrl={authUrl} validLogin={validLoginState} />
      <Popover>
        <PopoverTrigger>
          <Avatar key={avatarKey} src={avatarUrl}
          name={localStorage.getItem("userObject") ? JSON.parse(localStorage.getItem("userObject") as string).username : undefined} />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>{ localStorage.getItem("jws") ? 'Logout' : 'Login' }</PopoverHeader>
          <PopoverBody>
            <Center>
            {localStorage.getItem("jws") ? 
            <div>
              Your login expires at
              {` ${new Date((jose.decodeJwt(localStorage.getItem("jws")?? "").exp?? 0) * 1000).toLocaleTimeString()}`}
              <Center><Button onClick={logout}>Logout</Button></Center>
            </div> :
            <Center><a href={authUrl}><Button>Discord redirect <ExternalLinkIcon /></Button></a></Center>
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
    setValidLoginState(false);
    setAvatarUrl("");
    setAvatarKey(avatarKey + 1);
  }
}

type expirationWarningProps = {
  authUrl: string,
  validLogin: boolean
}

function ExpirationWarning(props: expirationWarningProps) {
  const warning = (
    <a href={props.authUrl}>
      <Tooltip label="Your login expired. Click to relogin.">
        <WarningTwoIcon boxSize="2vw" color="GttOrange.400" />
      </Tooltip>
    </a>
  );

  return (
    <>
      {!props.validLogin && localStorage.getItem("jws") ? warning : ""}
    </>
  );
}
