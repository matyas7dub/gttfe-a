import { Center, CreateToastFnReturn, Spinner, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"
import * as jose from 'jose';

export default function LoginScript() {
  let searchParams = useSearchParams();
  const navigate = useNavigate();
  let code = searchParams[0].get('code');
  let state = searchParams[0].get('state');
  let httpBody = {
    "code": code,
    "state": state,
    "redirect_uri": process.env.REACT_APP_AUTH_REDIRECT,
    "school_id": 1
  };

  const toast = useToast();

  useEffect(() => {
    console.error("REMOVE THE SCHOOL ID THING AT LINE 14 IN LOGIN SCRIPT!!!");
    let jsonHeader = new Headers();
    jsonHeader.append("Content-Type", "application/json")
    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + '/backend/discord/token'),
    {
      method: "POST",
      headers: jsonHeader,
      body: JSON.stringify(httpBody),
    })
    .then(async response => {
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("jws", data.jws);
        localStorage.setItem("userObject", JSON.stringify(data.userObject));
      } else {
        console.error("Couldn't get jws from API:", data.msg);
        toast({
          title: "Couldn't get jws from API",
          description: data.msg?? data.message?? "Unknown error",
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      }
      navigate('/');
    })
    .then(() => {
      if (localStorage.getItem("requestCache") != null) {
        const cache = JSON.parse(localStorage.getItem("requestCache")?? "this will intentionally crash the parser and it shouldnt ever get here");

        const authorizationIndex = cache.request.headers.flat(1).findIndex((x: string) => x === "Authorization");
        if (authorizationIndex !== -1) {
          cache.request.headers[(authorizationIndex + 2)/2 - 1][1] = `Bearer ${localStorage.getItem("jws")}`;
        }

        fetchWithToast(cache.url, cache.request.method, cache.request.headers, cache.request.body, cache.successMessage, toast)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <Center w="100%" h="80vh">
        <Spinner size='xl' />
      </Center>
  )
}

export function fetchGracefully(url: string, method: string, body: string | null, headers: [string, string][], successMessage: string, toast: CreateToastFnReturn) {
  // The headers have to be [string, string][] otherwise they get lost at some point
  successMessage = successMessage?? "Success";

  if ((jose.decodeJwt(localStorage.getItem("jws")?? "").exp?? 0) * 1000 < Date.now()) {
    const cache = {
      url: url,
      successMessage: successMessage,
      request: {
        method: method,
        headers: headers,
        body: body?? undefined
      },
    };
    localStorage.setItem("requestCache", JSON.stringify(cache));
  
    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + '/backend/discord/auth')
    )
    .then(response => response.json())
    .then(authUrl => window.location.href = authUrl.redirect_url + `&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}`)
    .catch(error => console.error('Error:', error));
  } else {
    fetchWithToast(url, method, headers, body, successMessage, toast);
  }
}

function fetchWithToast(url: string, method: string, headers: [string, string][], body: string | null, successMessage: string, toast: CreateToastFnReturn) {
  fetch(url,
    {
      method: method,
      headers: new Headers(headers),
      body: body?? undefined
    })
  .then(async response => {
    if (response.ok) {
      toast({
        title: successMessage,
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      localStorage.removeItem("requestCache");
    } else {
      const data = await response.json();
      toast({
        title: 'Error',
        description: data.msg?? data.message?? 'Unknown error.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  })
  .catch(error => console.error("Error:", error));
}
