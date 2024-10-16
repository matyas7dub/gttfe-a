import { createRef, useEffect, useState } from 'react';
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
  useToast,
  Badge,
} from '@chakra-ui/react'
import { ExternalLinkIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { backendUrl, loginPath } from '../../../config/config';

export default function Login() {
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("userObject") ? getAvatarFromUserObject() : "");
  const [avatarKey, setAvatarKey] = useState(0);
  const [authUrl, setAuthUrl] = useState("");
  const [validLoginState, setValidLoginState] = useState(true);
  const [roleBadges, setRoleBadges] = useState<JSX.Element[]>();

  const toast = useToast();

  const focusRef = createRef<HTMLButtonElement>();

  useEffect(() => {
    if (!validLoginState) {
      fetch(backendUrl + '/backend/discord/auth')
      .then(response => response.json())
      .then(url => setAuthUrl(url.redirectUrl + `&redirect_uri=${window.location.origin + loginPath}`))
      .catch(error => console.error('Error:', error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validLoginState]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => afterLogin(), [])

  function afterLogin() {
    const validLogin = validJws();
    setValidLoginState(validLogin);

    getRoleBadges();
    setAvatarUrl(getAvatarFromUserObject());
    setAvatarKey(avatarKey + 1);
  }

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

  function getRoleBadges() {
    const userObject = localStorage.getItem("userObject");
    if (userObject) {
      const userJsonObject = JSON.parse(userObject);
      fetch(backendUrl + `/backend/user/${userJsonObject.id}/assignedRoles/`)
      .then(response => response.json())
      .then(data => {
        const roleBadges: JSX.Element[] = [];
        for (let role of data) {
          roleBadges.push(
            <Badge marginRight="0.3em">{role.roleName}</Badge>
          );
        }
        setRoleBadges(roleBadges);
      })
      .catch(error => console.error("Error", error));
    }
  }

  return(
    <Stack direction="row" align="center">
      <ExpirationWarning authUrl={authUrl} validLogin={validLoginState} />
      <Popover initialFocusRef={focusRef}>
        <PopoverTrigger>
          <Avatar key={avatarKey} src={avatarUrl}
          name={localStorage.getItem("userObject") ? JSON.parse(localStorage.getItem("userObject") as string).username : undefined} />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton  ref={focusRef}/>
          <PopoverHeader>{ localStorage.getItem("jws") ? 'Logout' : 'Login' }</PopoverHeader>
          <PopoverBody>
            {localStorage.getItem("jws") ? 
            <Center>
            <Stack direction="column">
              <Center>{roleBadges}</Center>
              <>
              Your login expires at
              {` ${new Date((jose.decodeJwt(localStorage.getItem("jws")?? "").exp?? 0) * 1000).toLocaleTimeString()}`}
              </>
              <Center><Button onClick={logout}>Logout</Button></Center>
            </Stack>
            </Center>
            :
            <Center><Button onClick={login}>Discord redirect <ExternalLinkIcon /></Button></Center>
            }
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

  function login() {
    window.open(authUrl, "_blank");

    const interval = setInterval(() => {
      if (localStorage.getItem("loginResult")) {
        clearInterval(interval);
        const loginResult = localStorage.getItem("loginResult");
        localStorage.removeItem("loginResult");
        if (loginResult === "success") {
          afterLogin();
          toast({
            title: 'Logged in',
            description: 'Successfully logged in',
            status: 'success',
            duration: 5000,
            isClosable: true
          });
        } else {
          toast({
            title: 'Error',
            description: loginResult,
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      }
    }, 1000);
  }

  type expirationWarningProps = {
    authUrl: string,
    validLogin: boolean
  }

  function ExpirationWarning(props: expirationWarningProps) {
    const warning = (
      <Tooltip label="Your login expired. Click to relogin.">
        <WarningTwoIcon onClick={login} cursor="pointer" boxSize="2vw" color="GttOrange.400" />
      </Tooltip>
    );
  
    return (
      <>
        {!props.validLogin && localStorage.getItem("jws") ? warning : ""}
      </>
    );
  }
}

